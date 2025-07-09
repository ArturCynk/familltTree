import { Request, Response } from 'express';
import { DataTransferService } from '../services/dataTransferService';

function handleExportError(res: Response, error: Error) {
  if (error.message.includes('User not found')) {
    return res.status(404).json({ message: error.message });
  }
  if (error.message.includes('Invalid fields')) {
    return res.status(400).json({ message: error.message });
  }
  res.status(500).json({ message: 'Internal server error' });
}

function extractFilters(req: Request): any {
  return {
    gender: req.query.gender as string | undefined,
    status: req.query.status as string | undefined,
    bornBefore: req.query.bornBefore as string | undefined,
    bornAfter: req.query.bornAfter as string | undefined,
    diedBefore: req.query.diedBefore as string | undefined,
    diedAfter: req.query.diedAfter as string | undefined,
    // Dodajemy nowe filtry relacyjne
    hasSpouse: req.query.hasSpouse as string | undefined,
    hasChildren: req.query.hasChildren as string | undefined,
    hasSiblings: req.query.hasSiblings as string | undefined,
    birthPlace: req.query.birthPlace as string | undefined,
    deathPlace: req.query.deathPlace as string | undefined,
    burialPlace: req.query.burialPlace as string | undefined
  };
}

// import json 
export const importJson = async (req: Request, res: Response) => {

}
// import exel
export const importExel = async (req: Request, res: Response) => {
    
}
// import csv
export const importCsv = async (req: Request, res: Response) => {
    
}
//export json 
export const exportJson = async (req: Request, res: Response) => {
  try {
    // Zakładam, że email jest w req.user.email (np. po autoryzacji)
    const userEmail = req.user?.email as string;
    if (!userEmail) return res.status(401).json({ message: 'Unauthorized' });

    const fieldsParam = req.query.fields as string; 
    const selectedFields = fieldsParam ? fieldsParam.split(',') : undefined;
    const filters = extractFilters(req);


    const persons = await DataTransferService.exportJson(userEmail,selectedFields,filters);
    
    const jsonData = JSON.stringify(persons);

        const userId = req.user?._id; // Zakładając, że authenticateToken dodaje _id do req.user
    const filename = `persons_${userId}`;
    
    // Nagłówki do pobrania pliku JSON
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonData);

  } catch (error: any) {
    handleExportError(res, error);
}
};
// export exel
export const exportExel = async (req: Request, res: Response) => {
  try {
    const email = req.user?.email as string;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });

    const fieldsParam = req.query.fields as string; 
    const selectedFields = fieldsParam ? fieldsParam.split(',') : undefined;
    const filters = extractFilters(req);


    const excelBuffer = await DataTransferService.exportExel(email,selectedFields,filters);

        const userId = req.user?._id; // Zakładając, że authenticateToken dodaje _id do req.user
    const filename = `persons_${userId}`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    res.status(200).send(excelBuffer);
  } catch (error: any) {
      handleExportError(res, error);
  }
};
// export csv
export const exportCsv = async (req: Request, res: Response) => {
  try {
    const email = req.user?.email as string;
    if (!email) return res.status(401).json({ message: 'Unauthorized' });

    const fieldsParam = req.query.fields as string; 
    const selectedFields = fieldsParam ? fieldsParam.split(',') : undefined;
    const filters = extractFilters(req);


    const csvData = await DataTransferService.exportCsv(email, selectedFields,filters);

    const userId = req.user?._id; // Zakładając, że authenticateToken dodaje _id do req.user
    const filename = `persons_${userId}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    res.status(200).send(csvData);
  } catch (error: any) {
    handleExportError(res, error);
  }
};