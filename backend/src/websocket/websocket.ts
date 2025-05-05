import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import FamilyTree from '../models/FamilyTree';
import { PersonService } from '../services/personServices';

const familyTreeClients = new Map<string, WebSocket[]>();
const personService = new PersonService();

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
          if (data.type !== 'auth' || !data.token || !data.familyTreeId) throw new Error('Auth required');
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET as string) as { userId: string };
          const tree = await FamilyTree.findById(data.familyTreeId);
          if (!tree) throw new Error('Tree not found');
          const isMember = tree.owner.equals(decoded.userId) || tree.members.some(m => m.user.equals(decoded.userId));
          if (!isMember) throw new Error('Access denied');

          familyTreeId = data.familyTreeId;
          userId = decoded.userId;

          // Register ws
          if (!familyTreeClients.has(familyTreeId)) familyTreeClients.set(familyTreeId, []);
          familyTreeClients.get(familyTreeId)!.push(ws);

          // Send initial full data only once
          const persons = await personService.getAllPersonsWithRelations('familyTree', undefined, familyTreeId);
          return ws.send(JSON.stringify({ type: 'init', data: persons }));
        }

        let payload: any;
        let broadcast = false;
        let messageType: string;

        switch (data.type) {
          case 'getAllPersons':
            payload = await personService.getAllPersons(data.query,'familyTree', undefined, familyTreeId);
            messageType = 'allPersons';
            break;

          case 'getPerson':
            payload = await personService.getPerson(data.personId, 'familyTree', undefined, familyTreeId);
            messageType = 'person';
            break;


          case 'updatePerson':
            payload = await personService.updatePerson(data.personId, data.body, 'familyTree', undefined, familyTreeId);
            messageType = 'personUpdated';
            broadcast = true;
            break;

          case 'deletePerson':
            await personService.deletePerson(data.personId, 'familyTree', undefined, familyTreeId);
            payload = { personId: data.personId };
            messageType = 'personDeleted';
            broadcast = true;
            break;

          case 'addPersonWithRelationships':
            payload = await personService.addPersonWithRelationships({ type: 'familyTree', userEmail: undefined, file: undefined, body: data.body,treeId:familyTreeId });
            messageType = 'personWithRelationsAdded';
            broadcast = true;
            break;

          case 'deleteRelation':
            await personService.deleteRelation(data.personId, data.relationId, 'familyTree', undefined, familyTreeId);
            payload = { personId: data.personId, relationId: data.relationId };
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
            payload = { personId: data.personId, relatedPersonId: data.relatedPersonId, relationType: data.relationType };
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

        // Respond to requester
        ws.send(JSON.stringify({ type: messageType, data: payload }));

        // Broadcast to all other clients if needed
        if (broadcast) {
          const clients = familyTreeClients.get(familyTreeId) || [];
          clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: messageType, data: payload }));
            }
          });
        }

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        ws.send(JSON.stringify({ type: 'error', message: msg }));
        cleanup();
        ws.close();
      }
    });

    ws.on('close', cleanup);
    ws.on('error', cleanup);
  });
};
