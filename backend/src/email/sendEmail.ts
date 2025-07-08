import sgMail from '@sendgrid/mail';
import getActivationEmailTemplate from './templates/activationEmail';
import getPasswordResetEmailTemplate from './templates/resetPasswordEmail';

// Upewnij się, że zmienna środowiskowa jest załadowana
import dotenv from 'dotenv';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID as string);

export const sendActivationEmail = async (email: string, activationLink: string): Promise<void> => {
    const msg = {
      to: email,
      from: 'generalzn1@gmail.com', 
      subject: 'Aktywacja konta',
      html: getActivationEmailTemplate(activationLink),
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending activation email:', error);
      throw new Error('Failed to send activation email');
    }
};

export const send2FACodeEmail = async (
  email: string,
  type: 'enabled' | 'disabled' | 'login',
  code?: string
) => {
  let subject, text;

  switch (type) {
    case 'enabled':
      subject = '2FA Włączone';
      text = `Uwierzytelnianie dwuskładnikowe zostało włączone na Twoim koncie.`;
      break;
    case 'disabled':
      subject = '2FA Wyłączone';
      text = `Uwierzytelnianie dwuskładnikowe zostało wyłączone na Twoim koncie.`;
      break;
    case 'login':
      subject = 'Twój kod weryfikacyjny';
      text = `Twój kod weryfikacyjny: ${code}\nKod jest ważny przez 5 minut.`;
      break;
  }

const msg = {
        to: email,
        from: 'generalzn1@gmail.com', 
        subject: subject,
        html: text
      };
  await sgMail.send(msg);
};


export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    const msg = {
        to: email,
        from: 'generalzn1@gmail.com', 
        subject: 'Zmiana Hasła',
        html: getPasswordResetEmailTemplate(resetLink),
      };
      try {
        await sgMail.send(msg);
      } catch (error) {
        throw new Error('Failed to send activation email');
      }
};