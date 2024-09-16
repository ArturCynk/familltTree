const getActivationEmailTemplate = (activationLink: string): string => {
  const template = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aktywuj swoje konto</title>
      <style>
        body, html {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px 0;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 24px;
        }
          a{
            text-decoration: none;
          }
        .content {
            margin-top: 20px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            margin-bottom: 15px;
        }
        .button-container {
            text-align: center;
            margin-top: 30px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #45a049;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #888888;
        }
        .tree-info {
            border-top: 1px solid #e0e0e0;
            margin-top: 20px;
            padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Witaj w naszej usłudze!</h1>
        </div>
        <div class="content">
          <p>Szanowny Użytkowniku,</p>
          <p>Dziękujemy za zarejestrowanie się w naszej usłudze. Aby zakończyć rejestrację i aktywować swoje konto, kliknij przycisk poniżej:</p>
          <div class="button-container">
            <a href="${activationLink}" class="button">Aktywuj Konto</a>
          </div>
          <p>Jeśli nie rejestrowałeś się w naszej usłudze, zignoruj tę wiadomość.</p>
          <div class="tree-info">
            <h2>Drzewo Genealogiczne</h2>
            <p>Nasza usługa pozwala na tworzenie i zarządzanie drzewem genealogicznym, co jest idealne do śledzenia historii rodziny i łączenia różnych gałęzi rodzinnych. Możesz łatwo dodawać nowych członków, łączyć ich w rodzinie i przeglądać historię swojej rodziny w przejrzysty sposób.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Twoja Usługa. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return template;
};

export default getActivationEmailTemplate;
