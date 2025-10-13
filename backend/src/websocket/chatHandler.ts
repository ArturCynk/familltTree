// websocket/chatHandler.ts
import { WebSocket } from 'ws';
import mongoose from 'mongoose';
import ChatMessage, { IReaction } from '../models/ChatMessage';
import FamilyTree from '../models/FamilyTree';
import User from '../models/User';

export class ChatHandler {
  private familyTreeClients: Map<string, WebSocket[]>;

  constructor(familyTreeClients: Map<string, WebSocket[]>) {
    this.familyTreeClients = familyTreeClients;
  }

  private toObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
    return typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
  }

  private equalsId(id1: string | mongoose.Types.ObjectId, id2: string | mongoose.Types.ObjectId): boolean {
    return this.toObjectId(id1).equals(this.toObjectId(id2));
  }

  /** Obsługa wysyłania wiadomości czatu */
  async handleChatMessage(ws: WebSocket, data: any, familyTreeId: string, userId: string) {
    try {
      const { message, replyTo, type = 'text' } = data;
      console.log('📩 Received chat message:', data);

      const tree = await FamilyTree.findById(familyTreeId);
      if (!tree) throw new Error('Tree not found');

      const isMember =
        this.equalsId(tree.owner, userId) ||
        tree.members.some(m => this.equalsId(m.user, userId));

      if (!isMember) throw new Error('Access denied');

      const chatMessage = new ChatMessage({
        familyTree: this.toObjectId(familyTreeId),
        user: this.toObjectId(userId),
        message: message.trim(),
        type: type === 'text' ? 'text' : 'text',
        replyTo: replyTo ? this.toObjectId(replyTo) : undefined,
        readBy: [this.toObjectId(userId)],
        reactions: [],
        edited: false,
        editHistory: [],
        deleted: false
      });

      await chatMessage.save();
      await chatMessage.populate('user', 'name email avatar');
      await chatMessage.populate({
        path: 'replyTo',
        select: 'message user createdAt',
        populate: { path: 'user', select: 'name email' }
      });

      const payload = this.formatMessagePayload(chatMessage);

      this.broadcastToFamilyTree(
        familyTreeId,
        { type: 'chat_message', data: payload },
        ws
      );

      return payload;
    } catch (error: any) {
      console.error('❌ Error in handleChatMessage:', error.message);
      throw error;
    }
  }

  /** Edycja wiadomości */
  async editMessage(messageId: string, newMessage: string, userId: string) {
    try {
      const message = await ChatMessage.findById(messageId);
      if (!message) throw new Error('Message not found');

      // Sprawdź uprawnienia (tylko autor może edytować)
      if (!this.equalsId(message.user, userId)) {
        throw new Error('You can only edit your own messages');
      }

      if (message.deleted) {
        throw new Error('Cannot edit deleted message');
      }

      // Zapisz poprzednią wersję w historii
      message.editHistory.push({
        previousMessage: message.message,
        editedAt: new Date()
      });

      message.message = newMessage.trim();
      message.edited = true;
      message.updatedAt = new Date();

      await message.save();
      await message.populate('user', 'name email avatar');
      await message.populate({
        path: 'replyTo',
        select: 'message user createdAt',
        populate: { path: 'user', select: 'name email' }
      });

      const payload = this.formatMessagePayload(message);

      this.broadcastToFamilyTree(message.familyTree.toString(), {
        type: 'message_edited',
        data: payload
      });

      return payload;
    } catch (error: any) {
      console.error('❌ Error in editMessage:', error.message);
      throw error;
    }
  }

  /** Dodawanie/usuwanie reakcji */
  async handleReaction(messageId: string, emoji: string, userId: string, familyTreeId: string) {
    try {
      const message = await ChatMessage.findById(messageId);
      if (!message) throw new Error('Message not found');

      if (message.deleted) {
        throw new Error('Cannot react to deleted message');
      }

      const existingReactionIndex = message.reactions.findIndex(
        reaction => 
          this.equalsId(reaction.user, userId) && 
          reaction.emoji === emoji
      );

      let operation: 'added' | 'removed';
      
      if (existingReactionIndex > -1) {
        // Usuń reakcję
        message.reactions.splice(existingReactionIndex, 1);
        operation = 'removed';
      } else {
        // Dodaj reakcję
        const newReaction: IReaction = {
          user: this.toObjectId(userId),
          emoji,
          createdAt: new Date()
        };
        message.reactions.push(newReaction);
        operation = 'added';
      }

      await message.save();
      await message.populate('reactions.user', 'name email avatar');
      await message.populate('user', 'name email avatar');
      await message.populate({
        path: 'replyTo',
        select: 'message user createdAt',
        populate: { path: 'user', select: 'name email' }
      });

      const payload = this.formatMessagePayload(message);

      this.broadcastToFamilyTree(familyTreeId, {
        type: 'reaction_updated',
        data: {
          message: payload,
          reaction: { emoji, userId, operation }
        }
      });

      return payload;
    } catch (error: any) {
      console.error('❌ Error in handleReaction:', error.message);
      throw error;
    }
  }

  /** Usuwanie wiadomości (soft delete) */
  async deleteMessage(messageId: string, userId: string, familyTreeId: string) {
    try {
      const message = await ChatMessage.findById(messageId);
      if (!message) throw new Error('Message not found');

      const tree = await FamilyTree.findById(familyTreeId);
      if (!tree) throw new Error('Tree not found');

      // Sprawdź uprawnienia (autor lub admin)
      const isAuthor = this.equalsId(message.user, userId);
      const isAdmin = 
        this.equalsId(tree.owner, userId) || 
        tree.members.some(m => this.equalsId(m.user, userId) && m.role === 'admin');

      if (!isAuthor && !isAdmin) {
        throw new Error('Insufficient permissions');
      }

      // Soft delete
      message.deleted = true;
      message.deletedAt = new Date();
      message.deletedBy = this.toObjectId(userId);
      message.message = 'Wiadomość została usunięta';
      message.reactions = [];
      message.editHistory = [];

      await message.save();

      const payload = this.formatMessagePayload(message);

      this.broadcastToFamilyTree(familyTreeId, {
        type: 'message_deleted',
        data: payload
      });

      return payload;
    } catch (error: any) {
      console.error('❌ Error in deleteMessage:', error.message);
      throw error;
    }
  }

  /** Pobieranie historii edycji */
  async getEditHistory(messageId: string, userId: string) {
    try {
      const message = await ChatMessage.findById(messageId)
        .select('editHistory user')
        .populate('user', 'name email');

      if (!message) throw new Error('Message not found');

      // Tylko autor lub admin może zobaczyć historię edycji
      const tree = await FamilyTree.findOne({ 
        $or: [
          { owner: userId },
          { members: { $elemMatch: { user: userId } } }
        ]
      });

      if (!tree) throw new Error('Access denied');

      return {
        messageId: message._id,
        currentMessage: message.message,
        editHistory: message.editHistory,
        author: message.user
      };
    } catch (error: any) {
      console.error('❌ Error in getEditHistory:', error.message);
      throw error;
    }
  }

  /** Pobieranie historii czatu z rozszerzonymi funkcjami */
  async getChatHistory(familyTreeId: string, userId: string, limit: number, before?: string) {
    try {
      const tree = await FamilyTree.findById(familyTreeId);
      if (!tree) throw new Error('Tree not found');

      const isMember =
        this.equalsId(tree.owner, userId) ||
        tree.members.some(m => this.equalsId(m.user, userId));

      if (!isMember) throw new Error('Access denied');

      const query: any = { 
        familyTree: this.toObjectId(familyTreeId),
        deleted: false // Nie pokazuj usuniętych wiadomości
      };
      

      const messages = await ChatMessage.find({familyTree:familyTreeId})
        .populate('user', 'name email avatar')
        .populate('reactions.user', 'name email avatar')
        .populate({
          path: 'replyTo',
          select: 'message user createdAt deleted',
          populate: { 
            path: 'user', 
            select: 'name email',

          }
        })
        .sort({ createdAt: -1 })

        console.log(await ChatMessage.countDocuments(query));
        

      // Oznacz jako przeczytane
      const unreadIds = messages
        .filter(msg => !msg.readBy.some(readById => this.equalsId(readById, userId)))
        .map(msg => msg._id);

      if (unreadIds.length > 0) {
        await ChatMessage.updateMany(
          { _id: { $in: unreadIds } },
          { $addToSet: { readBy: this.toObjectId(userId) } }
        );
      }

      return messages.reverse().map(msg => this.formatMessagePayload(msg));
    } catch (error: any) {
      console.error('❌ Error in getChatHistory:', error.message);
      throw error;
    }
  }

  /** Formatowanie wiadomości dla klienta */
  private formatMessagePayload(message: any) {
    return {
      _id: message._id,
      familyTree: message.familyTree,
      user: message.user,
      message: message.message,
      type: message.type,
      replyTo: message.replyTo,
      readBy: message.readBy.map((id: any) => id.toString()),
      reactions: message.reactions.map((reaction: any) => ({
        emoji: reaction.emoji,
        user: reaction.user,
        createdAt: reaction.createdAt
      })),
      edited: message.edited,
      editHistory: message.editHistory,
      deleted: message.deleted,
      deletedAt: message.deletedAt,
      deletedBy: message.deletedBy,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };
  }

    async markAsRead(messageId: string, userId: string) {
    try {
      await ChatMessage.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: this.toObjectId(userId) }
      });
    } catch (error: any) {
      console.error('❌ Error in markAsRead:', error.message);
      throw error;
    }
  }

  private broadcastToFamilyTree(familyTreeId: string, message: any, excludeWs?: WebSocket) {
    const clients = this.familyTreeClients.get(familyTreeId) || [];

    clients.forEach(client => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(message));
        } catch (error) {
          console.warn('⚠️ Error sending message to client:', error);
        }
      }
    });
  }
}