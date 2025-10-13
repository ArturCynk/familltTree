// services/chatService.ts
import ChatMessage from '../models/ChatMessage';
import FamilyTree from '../models/FamilyTree';

export class ChatService {
  async getUnreadCount(familyTreeId: string, userId: string): Promise<number> {
    return ChatMessage.countDocuments({
      familyTree: familyTreeId,
      readBy: { $ne: userId },
      user: { $ne: userId } // Nie licz wiadomości użytkownika
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await ChatMessage.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    // Sprawdź uprawnienia (tylko autor lub admin może usunąć)
    const tree = await FamilyTree.findById(message.familyTree);
    if (!tree) throw new Error('Tree not found');

    const isAuthor = message.user.equals(userId);
    const isAdmin = tree.owner.equals(userId) || 
      tree.members.some(m => m.user.equals(userId) && m.role === 'admin');

    if (!isAuthor && !isAdmin) {
      throw new Error('Insufficient permissions');
    }

    await ChatMessage.findByIdAndDelete(messageId);
  }

  async searchMessages(familyTreeId: string, query: string, userId: string): Promise<any[]> {
    // Sprawdź uprawnienia
    const tree = await FamilyTree.findById(familyTreeId);
    if (!tree) throw new Error('Tree not found');

    const isMember = tree.owner.equals(userId) || 
      tree.members.some(m => m.user.equals(userId));
    
    if (!isMember) throw new Error('Access denied');

    return ChatMessage.find({
      familyTree: familyTreeId,
      message: { $regex: query, $options: 'i' }
    })
    .populate('user', 'email')
    .sort({ createdAt: -1 })
    .lean();
  }
}