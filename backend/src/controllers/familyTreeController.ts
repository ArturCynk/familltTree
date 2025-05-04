import { Request, Response } from 'express';
import FamilyTree from '../models/FamilyTree';
import User from '../models/User'; // Potrzebny żeby sprawdzić istnienie użytkownika
import mongoose, { Types } from 'mongoose';

// Tworzenie drzewa
export const createFamilyTree = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newTree = new FamilyTree({
      name,
      owner: existingUser._id,
      persons: [],
      members: [
        { user: existingUser._id, role: 'admin' }
      ]
    });

    await newTree.save();
    res.status(201).json(newTree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating family tree' });
  }
};

// Dodawanie członka do drzewa
export const addMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user, role } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user?.email }).populate('persons').exec();

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(existingUser._id);
    
    

    const tree = await FamilyTree.findById(id);
    if (!tree) return res.status(404).json({ message: 'Family tree not found' });

    const currentUserMember = tree.members.find(m => m.user.toString() === (existingUser._id as mongoose.Types.ObjectId).toString());
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    const userToAdd = await User.findById(user);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User to add not found' });
    }

    const alreadyMember = tree.members.find(m => m.user.toString() === user);
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    tree.members.push({ user: new mongoose.Types.ObjectId(user), role });
    await tree.save();

    res.status(200).json(tree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding member' });
  }
};

// Edytowanie członka drzewa
export const editMember = async (req: Request, res: Response) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tree = await FamilyTree.findById(id);
    if (!tree) return res.status(404).json({ message: 'Family tree not found' });

    const currentUserMember = tree.members.find(m => m.user.toString() === (existingUser._id as mongoose.Types.ObjectId).toString());
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can edit members' });
    }

    const member = tree.members.find(m => m._id?.toString() === memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.role = role;
    await tree.save();

    res.status(200).json(tree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error editing member' });
  }
};

// Usuwanie członka z drzewa
export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id, memberId } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tree = await FamilyTree.findById(id);
    if (!tree) return res.status(404).json({ message: 'Family tree not found' });

    const currentUserMember = tree.members.find(m => m.user.toString() === (existingUser._id as mongoose.Types.ObjectId).toString());
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete members' });
    }

    const member = tree.members.find(m => m._id?.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    tree.members = tree.members.filter(m => m._id?.toString() !== memberId);
    await tree.save();

    res.status(200).json(tree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting member' });
  }
};

// Zmiana nazwy drzewa — tylko właściciel (owner) może to zrobić
export const renameFamilyTree = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(existingUser);
    

    const tree = await FamilyTree.findById(id);
    if (!tree) {
      return res.status(404).json({ message: 'Family tree not found' });
    }

    if (tree.owner.toString() !== (existingUser._id as mongoose.Types.ObjectId).toString()) {
      return res.status(403).json({ message: 'Only the owner can rename the family tree' });
    }

    tree.name = name;
    await tree.save();

    res.status(200).json(tree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error renaming family tree' });
  }
};

export const importFamilyTree = async (req: Request, res: Response) => {
  try {
    const { targetTreeId } = req.params;
    const { sourceTreeId } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetTree = await FamilyTree.findById(targetTreeId);

    if (!targetTree) {
      return res.status(404).json({ message: 'Source or target family tree not found' });
    }

    if (targetTree.persons.length !== 0) {
      return res.status(400).json({ message: "Target tree must be empty to import" });
    }

    if (targetTree.owner.toString() !== (existingUser._id as mongoose.Types.ObjectId).toString()) {
      return res.status(403).json({ message: 'Only the owner can rename the family tree' });
    }
    
    // Skopiuj wszystkie osoby ze źródłowego drzewa do docelowego
    targetTree.persons.push(...existingUser.persons);

    await targetTree.save();

    res.status(200).json({ message: 'Family tree imported successfully', targetTree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error importing family tree' });
  }
};

// Zmiana właściciela drzewa — tylko obecny właściciel może zmienić właściciela
export const changeOwner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tree = await FamilyTree.findById(id);
    if (!tree) {
      return res.status(404).json({ message: 'Family tree not found' });
    }

    if (tree.owner.toString() !== (existingUser._id as mongoose.Types.ObjectId).toString()) {
      return res.status(403).json({ message: 'Only the current owner can change ownership' });
    }

    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
      return res.status(404).json({ message: 'New owner not found' });
    }

    tree.owner = newOwner._id as Types.ObjectId;

    // Dodaj nowego właściciela jako admina jeśli nie jest już członkiem
    const existingMember = tree.members.find(m => m.user.toString() === newOwnerId);
    if (!existingMember) {
      tree.members.push({ user: newOwner._id as Types.ObjectId, role: 'admin' });
    } else {
      existingMember.role = 'admin'; // Upewnij się, że ma uprawnienia admina
    }

    await tree.save();

    res.status(200).json({ message: 'Owner changed successfully', tree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error changing owner' });
  }
};

// Usuwanie całego drzewa — tylko właściciel
export const deleteFamilyTree = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tree = await FamilyTree.findById(id);
    if (!tree) {
      return res.status(404).json({ message: 'Family tree not found' });
    }

    if (tree.owner.toString() !== (existingUser._id as mongoose.Types.ObjectId).toString()) {
      return res.status(403).json({ message: 'Only the owner can delete the family tree' });
    }

    await tree.deleteOne();

    res.status(200).json({ message: 'Family tree deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting family tree' });
  }
};

// Usuwanie wszystkich osób z drzewa — tylko właściciel
export const deleteAllPersons = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tree = await FamilyTree.findById(id);
    if (!tree) {
      return res.status(404).json({ message: 'Family tree not found' });
    }

    if (tree.owner.toString() !== (existingUser._id as mongoose.Types.ObjectId).toString()) {
      return res.status(403).json({ message: 'Only the owner can delete persons from the tree' });
    }

    tree.persons = [];
    await tree.save();

    res.status(200).json({ message: 'All persons removed from the family tree', tree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting persons from family tree' });
  }
};

// Użytkownik sam opuszcza drzewo
export const leaveFamilyTree = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingUser = await User.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tree = await FamilyTree.findById(id);
    if (!tree) {
      return res.status(404).json({ message: 'Family tree not found' });
    }

    const member = tree.members.find(m => m.user.toString() === (existingUser._id as mongoose.Types.ObjectId).toString());
    if (!member) {
      return res.status(400).json({ message: 'You are not a member of this tree' });
    }

    if (tree.owner.toString() === (existingUser._id as mongoose.Types.ObjectId).toString()) {
      return res.status(400).json({ message: 'Owner cannot leave the family tree. Transfer ownership or delete the tree.' });
    }

    tree.members = tree.members.filter(m => m.user.toString() !== (existingUser._id as mongoose.Types.ObjectId).toString());
    await tree.save();

    res.status(200).json({ message: 'Successfully left the family tree', tree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error leaving the family tree' });
  }
};

interface PopulatedOwner {
  _id: string;
  name: string;
  email: string;
}

export const getUserTrees = async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Pobierz drzewa z populacją właściciela
    const trees = await FamilyTree.find(
      { 'members.user': user._id },
      { _id: 1, name: 1, owner: 1 }
    )
    .populate<{ owner: PopulatedOwner }>({
      path: 'owner',
      select: 'name email',
      model: 'User'
    })
    .lean();

    // Formatowanie wyników
    const formattedTrees = trees.map(tree => ({
      _id: tree._id,
      name: tree.name,
      owner: {
        name: tree.owner.name,
        email: tree.owner.email
      }
    }));

    res.status(200).json(formattedTrees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user trees' });
  }
};

export const getOwnedTrees = async (req: Request, res: Response) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trees = await FamilyTree.find({ owner: user._id })
      .populate<{ owner: PopulatedOwner }>({
        path: 'owner',
        select: 'name email',
        model: 'User'
      })
      .populate({
        path: 'members.user',
        select: 'email',
        model: 'User'
      })
      .lean();

    const enrichedTrees = trees.map(tree => ({
      ...tree,
      members: tree.members.map(member => ({
        _id: member._id,
        role: member.role,
        user: {
          _id: (member.user as any)._id,  // Type assertion needed
          email: (member.user as any).email
        },
      }))
    }));

    res.status(200).json(enrichedTrees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching owned trees' });
  }
};