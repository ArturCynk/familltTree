import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import FamilyTree from '../models/FamilyTree';
import { PersonService } from '../services/personServices';
import { ChatHandler } from './chatHandler';

const familyTreeClients = new Map<string, WebSocket[]>();
const personService = new PersonService();
const chatHandler = new ChatHandler(familyTreeClients);

export const initializeWebSocket = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    let familyTreeId: string;
    let userId: string;

    const cleanup = () => {
      if (familyTreeId) {
        const clients = familyTreeClients.get(familyTreeId) || [];
        const idx = clients.indexOf(ws);
        if (idx !== -1) clients.splice(idx, 1);
        familyTreeClients.set(familyTreeId, clients);
      }
    };

    ws.on('message', async (msg: Buffer) => {
      try {
        const data = JSON.parse(msg.toString());
        
        // Authentication phase
if (!familyTreeId) {
  if (data.type !== 'auth' || !data.token || !data.familyTreeId)
    throw new Error('Auth required');

  const decoded = jwt.verify(
    data.token,
    process.env.JWT_SECRET as string
  ) as { userId: string };

  const tree = await FamilyTree.findById(data.familyTreeId);
  if (!tree) throw new Error('Tree not found');

  const isOwner = tree.owner.equals(decoded.userId);
  const member = tree.members.find(m => m.user.equals(decoded.userId));

  if (!isOwner && !member) throw new Error('Access denied');

  familyTreeId = data.familyTreeId;
  userId = decoded.userId;

  // Ustal rolę użytkownika
  let role: 'owner' | 'admin' | 'editor' | 'guest';
  if (isOwner) {
    role = 'owner';
  } else {
    role = member!.role;
  }

  // Zarejestruj połączenie WebSocket
  if (!familyTreeClients.has(familyTreeId))
    familyTreeClients.set(familyTreeId, []);
  familyTreeClients.get(familyTreeId)!.push(ws);

  // Pobierz osoby z drzewa
  const persons = await personService.getAllPersonsWithRelations(
    'familyTree',
    undefined,
    familyTreeId
  );

  // Wyślij dane inicjalne wraz z rolą użytkownika
  return ws.send(
    JSON.stringify({
      type: 'init',
      data: {
        role,          // 👈 tu masz rolę użytkownika
        familyTreeId,
        persons,
      },
    })
  );
}


        // Zmieniamy logikę - dla niektórych operacji nie potrzebujemy standardowej odpowiedzi
        let shouldRespond = true;
        let payload: any = null;
        let broadcast = false;
        let messageType: string = 'unknown';

        switch (data.type) {
           case 'chat_message':
            const chatResult = await chatHandler.handleChatMessage(
              ws, data, familyTreeId, userId
            );
            payload = chatResult;
            messageType = 'chat_message_sent';
            break;

          case 'edit_message':
            payload = await chatHandler.editMessage(
              data.messageId, 
              data.newMessage, 
              userId
            );
            messageType = 'message_edited';
            broadcast = true;
            break;

          case 'add_reaction':
            payload = await chatHandler.handleReaction(
              data.messageId,
              data.emoji,
              userId,
              familyTreeId
            );
            messageType = 'reaction_updated';
            broadcast = true;
            break;

          case 'delete_message':
            payload = await chatHandler.deleteMessage(
              data.messageId,
              userId,
              familyTreeId
            );
            messageType = 'message_deleted';
            broadcast = true;
            break;

          case 'get_edit_history':
            payload = await chatHandler.getEditHistory(data.messageId, userId);
            messageType = 'edit_history';
            break;

          case 'get_chat_history':
            payload = await chatHandler.getChatHistory(
              familyTreeId, 
              userId, 
              data.limit, 
              data.before
            );
            messageType = 'chat_history';
            break;

          case 'mark_message_read':
            await chatHandler.markAsRead(data.messageId, userId);
            payload = { messageId: data.messageId, read: true };
            messageType = 'message_read';
            break;

          case 'typing_start':
          case 'typing_stop':
            const typingClients = familyTreeClients.get(familyTreeId) || [];
            typingClients.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: data.type,
                  data: {
                    userId: userId,
                    userName: data.userName
                  }
                }));
              }
            });
            shouldRespond = false;
            break;
          
          case 'getAllPersonsWithRelations':
            payload = await personService.getAllPersonsWithRelations('familyTree', undefined, familyTreeId);
            messageType = 'allPersonsWithRelations';
            break;

          case 'getAllPersons':
            payload = await personService.getAllPersons(data.query, 'familyTree', undefined, familyTreeId);
            messageType = 'allPersons';
            break;

          case 'getPerson':
            payload = await personService.getPerson(data.payload.id, 'familyTree', undefined, familyTreeId);
            messageType = 'person';
            break;

          case 'updatePerson':
            await personService.updatePerson(data.personId, data.body, 'familyTree', undefined, familyTreeId);
            payload = await personService.getAllPersonsWithRelations('familyTree', undefined, familyTreeId);
            messageType = 'personUpdated';
            broadcast = true;
            break;

          case 'deletePerson':
            await personService.deletePerson(data.personId, 'familyTree', undefined, familyTreeId);
            payload = await personService.getAllPersonsWithRelations('familyTree', undefined, familyTreeId);
            messageType = 'personDeleted';
            broadcast = true;
            break;

          case 'addPersonWithRelationships':
            await personService.addPersonWithRelationships({ 
              type: 'familyTree', 
              userEmail: undefined, 
              file: undefined, 
              body: data.body, 
              treeId: familyTreeId 
            });
            messageType = 'personWithRelationsAdded';
            payload = await personService.getAllPersonsWithRelations('familyTree', undefined, familyTreeId);
            broadcast = true;
            break;

          case 'deleteRelation':
            await personService.deleteRelation(data.personId, data.relationId, 'familyTree', undefined, familyTreeId);
            payload = await personService.getAllPersonsWithRelations('familyTree', undefined, familyTreeId);
            messageType = 'relationDeleted';
            broadcast = true;
            break;

          case 'addRelation':
            // Load the tree and populated persons
            const tree = await FamilyTree.findById(familyTreeId).populate('persons').exec();
            if (!tree) throw new Error('Tree not found');

            const person = tree.persons.find((p: any) => p._id.toString() === data.personId);
            const relatedPerson = tree.persons.find((p: any) => p._id.toString() === data.relatedPersonId);
            if (!person || !relatedPerson) {
              throw new Error('Person or related person not found');
            }

            // Add relation on the document
            switch (data.relationType) {
              case 'parent':
                if (!person.parents.includes(data.relatedPersonId)) person.parents.push(data.relatedPersonId);
                if (!relatedPerson.children.includes(data.personId)) relatedPerson.children.push(data.personId);
                break;

              case 'sibling':
                if (!person.siblings.includes(data.relatedPersonId)) person.siblings.push(data.relatedPersonId);
                if (!relatedPerson.siblings.includes(data.personId)) relatedPerson.siblings.push(data.personId);
                break;

              case 'spouse': {
                const now = new Date();
                if (!person.spouses.some((s: any) => s.personId.equals(data.relatedPersonId))) {
                  person.spouses.push({ personId: data.relatedPersonId, weddingDate: now });
                }
                if (!relatedPerson.spouses.some((s: any) => s.personId.equals(person._id))) {
                  relatedPerson.spouses.push({ personId: person._id, weddingDate: now });
                }
                break;
              }

              case 'child':
                if (!person.children.includes(data.relatedPersonId)) person.children.push(data.relatedPersonId);
                if (!relatedPerson.parents.includes(data.personId)) relatedPerson.parents.push(data.personId);
                break;

              default:
                throw new Error('Invalid relation type');
            }

            await tree.save();
            payload = { 
              personId: data.personId, 
              relatedPersonId: data.relatedPersonId, 
              relationType: data.relationType 
            };
            messageType = 'relationAdded';
            broadcast = true;
            break;

          case 'getRelations':
            payload = await personService.getRelationsForPerson(data.personId, 'familyTree', undefined, familyTreeId);
            messageType = 'relations';
            break;

          case 'getPersonsWithoutRelation':
            payload = await personService.getPersonsWithoutRelation(data.personId, 'familyTree', undefined, familyTreeId);
            messageType = 'personsWithoutRelation';
            break;

          case 'getFacts':
            payload = await personService.getEventsForPerson(data.personId, 'familyTree', undefined, familyTreeId);
            messageType = 'facts';
            break;

          default:
            throw new Error('Unknown operation');
        }

        // Respond to requester only if needed
        if (shouldRespond) {
          ws.send(JSON.stringify({ type: messageType, data: payload }));
        }

        // Broadcast to all other clients if needed
        if (broadcast) {
          const broadcastClients = familyTreeClients.get(familyTreeId) || [];
          broadcastClients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: messageType, data: payload }));
            }
          });
        }

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        ws.send(JSON.stringify({ type: 'error', message: errorMsg }));
        cleanup();
        ws.close();
      }
    });

    ws.on('close', cleanup);
    ws.on('error', cleanup);
  });
};