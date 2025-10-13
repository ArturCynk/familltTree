import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Person, { IPerson } from '../models/Person';
import User, { UserDocument } from '../models/User'; 
import jwt from 'jsonwebtoken';
import { PersonService } from '../services/personServices';
import { ChangeAction, EntityType } from '../models/ChangeLog';
import historyService from '../services/historyService';

const personService = new PersonService();

export const addPerson = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
      const person = await personService.addPerson({
        email: req.user?.email,
        file: req.file,
        body: req.body
      });

    res.status(201).json({ message: 'Osoba została dodana', person });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Wystąpił błąd podczas dodawania osoby', error });
  }
};

export const updatePerson = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const personId = req.params.id;
    const updateData = req.body;
    const file = req.file;

    const updatedPerson = await personService.updatePerson(personId,updateData,'user',req.user?.email,undefined,file)

    res.json({ message: 'Osoba została zaktualizowana', person: updatedPerson });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Wystąpił błąd podczas aktualizacji osoby' });
  }
};

export const deletePerson = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const personId = req.params.id;
    
    if (!req.user?.email) {
      res.status(401).json({ msg: 'Brak autoryzacji' });
      return;
    }

    const { deletedPersonId, updatedPersons } = await personService.deletePerson(
      personId,
      'user',
      req.user.email
    );
    
    res.status(200).json({ 
      message: 'Osoba została usunięta wraz z powiązaniami',
      deletedPersonId,
      updatedPersons
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania osoby';
    const status = error instanceof Error && error.message.includes('nie znalezion') ? 404 : 500;
    
    console.error(error);
    res.status(status).json({ 
      message,
      error: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.stack : null)
        : undefined
    });
  }
};
export const getAllPersons = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await personService.getAllPersons(req.query,'user',req.user?.email);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Błąd podczas pobierania użytkowników:', error);
    const status = error instanceof jwt.JsonWebTokenError ? 401 : 500;
    res.status(status).json({
      message: error instanceof Error ? error.message : 'Wystąpił błąd podczas pobierania użytkowników.'
    });
  }
};

export const getAllPersonss = async (req: Request, res: Response): Promise<void> => {
  try {
    // Pobranie użytkownika z osobami
    const userEmail = req.user?.email;

    if (!userEmail) {
      res.status(400).json({ msg: 'Nie znaleziono adresu e-mail użytkownika' });
      return;
    }

    // Użycie serwisu PersonService do pobrania osób z relacjami
    const result = await personService.getAllPersonsWithRelations('user',req.user?.email);

    res.status(200).send({
      users: result,
      totalUsers: result.length
    });
  } catch (error) {
    console.error('Błąd podczas pobierania użytkowników:', error);
    const status = error instanceof jwt.JsonWebTokenError ? 401 : 500;
    res.status(status).json({ 
      message: error instanceof Error ? error.message : 'Wystąpił błąd podczas pobierania użytkowników.' 
    });
  }
};

export const getPerson = async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user?.email; 
    const personId = req.params.id; 

    const person = await personService.getPerson(personId,'user',req.user?.email);

    res.json(person);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addPersonWithRelationships = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const person = await personService.addPersonWithRelationships({
      type: 'user',
      userEmail: req.user?.email,
      file: req.file,
      body: req.body
    });

const { newPerson, changedPersons } = person;

   res.status(201).json({
  message: 'Osoba została dodana z relacjami.',
  person: newPerson,
  changedPersons
});
  } catch (error: any) {
    console.error('Błąd podczas dodawania osoby z relacjami:', error);
    const status = error.message.includes('nie znalezion') ? 404 : 
                  error.message.includes('Niepoprawny typ') ? 400 : 500;
    res.status(status).json({ message: error.message || 'Wewnętrzny błąd serwera' });
  }
};
  
  export const getFact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  
      // Fetch the logged-in user and populate their persons field
      const loggedInUser = await User.findOne({ email: req.user?.email }).populate({
        path: 'persons',
        populate: [
          {
            path: 'children',
            select: 'firstName lastName birthDate deathDate spouses',
            populate: {
              path: 'spouses',
              select: 'firstName lastName'
            }
          },
          {
            path: 'spouses',
            select: 'firstName lastName birthDate deathDate'
          }
        ]
      }).exec();
  
      if (!loggedInUser) {
        res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
        return;
      }
  
      const events = await personService.getEventsForPerson(id,'user',req.user?.email);
  
      res.status(200).json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  export const getRelations = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const userEmail = req.user?.email;

      if (!userEmail) {
        return res.status(400).json({ msg: 'Nie znaleziono adresu e-mail użytkownika' });
      }
  
      
      const relations = await personService.getRelationsForPerson(id,'user',req.user?.email);
  
      // Zwrócenie relacji
      res.json(relations);
    } catch (error: any) {
      console.error('Error fetching relations:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  export const deleteRelationship = async (req: Request, res: Response) => {
    const { personId, relationId } = req.params;
  
    try {
      const userEmail = req.user?.email;
  
      if (!userEmail) {
        return res.status(400).json({ msg: 'Nie znaleziono adresu e-mail użytkownika' });
      }
  
      await personService.deleteRelation(personId,relationId,'user',req.user?.email);
  
      res.status(200).json({ message: 'Nastąpiło usunięcie relacji' });
    } catch (error: any) {
      console.error('Error removing relation:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getPersonsWithoutRelation = async (req: Request, res: Response) => {
    const personId = req.params.id; // ID osoby, dla której szukamy osób bez relacji
  
    try {
      const userEmail = req.user?.email;
  
      if (!userEmail) {
        return res.status(400).json({ msg: 'Nie znaleziono adresu e-mail użytkownika' });
      }
  
      // Wywołanie serwisu w celu pobrania osób bez relacji
      const personsWithoutRelation = await personService.getPersonsWithoutRelation(personId,'user',req.user?.email);
  
      // Mapowanie wyników, aby zwrócić tylko wymagane pola
      const result = personsWithoutRelation.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        _id: p._id
      }));
  
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Błąd serwera',
      });
    }
  };
  
export const addRelation = async (req: Request, res: Response) => {
  const { personId, relatedPersonId, relationType } = req.body;

  const validRelationTypes = ['parent', 'sibling', 'spouse', 'child'];
  if (!validRelationTypes.includes(relationType)) {
    return res.status(400).json({ message: 'Nieprawidłowy typ relacji' });
  }

  try {
    const loggedInUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

    if (!loggedInUser) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    const person = loggedInUser.persons.find((p: any) => p._id.toString() === personId);
    const relatedPerson = loggedInUser.persons.find((p: any) => p._id.toString() === relatedPersonId);

    if (!person || !relatedPerson) {
      return res.status(404).json({ message: 'Osoba nie znaleziona' });
    }

    // Capture original states BEFORE modification
    const originalPerson = person.toObject();
    const originalRelatedPerson = relatedPerson.toObject();
    
    let wasModified = false;
    let personRelationField: keyof IPerson | null = null; // Use keyof IPerson
    let relatedPersonRelationField: keyof IPerson | null = null; // Use keyof IPerson
    let weddingDate: Date | null = null;

    // Helper function to safely access IPerson properties
    const getPersonField = (person: any, field: keyof IPerson | null) => {
      return field ? person[field] : null;
    };

    switch (relationType) {
      case 'parent':
        if (!person.parents.includes(relatedPersonId)) {
          person.parents.push(relatedPersonId);
          personRelationField = 'parents';
          wasModified = true;
        }
        if (!relatedPerson.children.includes(personId)) {
          relatedPerson.children.push(personId);
          relatedPersonRelationField = 'children';
          wasModified = true;
        }
        break;

      case 'sibling':
        if (!person.siblings.includes(relatedPersonId)) {
          person.siblings.push(relatedPersonId);
          personRelationField = 'siblings';
          wasModified = true;
        }
        if (!relatedPerson.siblings.includes(personId)) {
          relatedPerson.siblings.push(personId);
          relatedPersonRelationField = 'siblings';
          wasModified = true;
        }
        break;

      case 'spouse': {
        const currentDate = new Date();
        weddingDate = currentDate;

        if (!person.spouses.some((s: any) => s.personId.equals(relatedPersonId))) {
          person.spouses.push({ personId: relatedPersonId, weddingDate: currentDate });
          personRelationField = 'spouses';
          wasModified = true;
        }
        if (!relatedPerson.spouses.some((s: any) => s.personId.equals(person._id))) {
          relatedPerson.spouses.push({ personId: person._id, weddingDate: currentDate });
          relatedPersonRelationField = 'spouses';
          wasModified = true;
        }
        break;
      }

      case 'child':
        if (!person.children.includes(relatedPersonId)) {
          person.children.push(relatedPersonId);
          personRelationField = 'children';
          wasModified = true;
        }
        if (!relatedPerson.parents.includes(personId)) {
          relatedPerson.parents.push(personId);
          relatedPersonRelationField = 'parents';
          wasModified = true;
        }
        break;

      default:
        return res.status(400).json({ message: 'Nieprawidłowy typ relacji' });
    }

    if (wasModified) {
      await loggedInUser.save();

      // Validate user ID
      if (!(loggedInUser._id instanceof mongoose.Types.ObjectId)) {
        throw new Error('Invalid user ID type');
      }

      await historyService.logChange(
        loggedInUser._id,
        person._id,
        EntityType.PERSON,
        ChangeAction.ADD_RELATION,
        {
          relationType,
          person: person.toObject(),
          relatedPerson: relatedPerson.toObject(),
          weddingDate
        },
        {
          changes: [
            {
              field: personRelationField || 'relation',
              oldValue: personRelationField ? getPersonField(originalPerson, personRelationField) : null,
              newValue: personRelationField ? getPersonField(person, personRelationField) : null
            },
            {
              field: relatedPersonRelationField || 'relation',
              oldValue: relatedPersonRelationField ? getPersonField(originalRelatedPerson, relatedPersonRelationField) : null,
              newValue: relatedPersonRelationField ? getPersonField(relatedPerson, relatedPersonRelationField) : null
            }
          ],
          relatedEntities: [{
            entityType: EntityType.PERSON,
            entityId: relatedPerson._id
          }]
        }
      );
    }

    return res.status(200).json({
      message: 'Relacja została pomyślnie dodana',
      changedPersons: [person, relatedPerson],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

export const generatePersonReport = async (req: Request, res: Response) => {
  try {
    const { personId } = req.params;
    const { treeId } = req.body;

    const doc = await personService.generatePersonReport(
      personId,
      'user',
      req.user?.email,
      treeId
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="raport-${personId}.pdf"`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Błąd generowania raportu PDF' });
  }
};
