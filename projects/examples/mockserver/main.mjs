import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 8181;

const app = express();

app.use(cors());
app.use(express.json());

const sciFiBooks = [
  { id: 1, title: 'Dune', author: 'Frank Herbert', year: 1965 },
  { id: 2, title: 'Neuromancer', author: 'William Gibson', year: 1984 },
  { id: 3, title: 'Snow Crash', author: 'Neal Stephenson', year: 1992 },
  { id: 4, title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', year: 1969 },
  { id: 5, title: 'Hyperion', author: 'Dan Simmons', year: 1989 },
  { id: 6, title: 'Foundation', author: 'Isaac Asimov', year: 1951 },
  { id: 7, title: 'The Forever War', author: 'Joe Haldeman', year: 1974 },
  { id: 8, title: 'Rendezvous with Rama', author: 'Arthur C. Clarke', year: 1973 },
  { id: 9, title: "Ender's Game", author: 'Orson Scott Card', year: 1985 },
  { id: 10, title: 'The Stars My Destination', author: 'Alfred Bester', year: 1956 }
];

const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Unauthorized');

  // Basic check for a Bearer token
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).send('Invalid Token Format');

  // Simulate token validation
  req.user = { id: 1, name: 'John Doe' };
  next();
};

app.get('/api/books', validateToken, (req, res) => {
  res.json(sciFiBooks);
});

app.use((err, req, res) => {
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
