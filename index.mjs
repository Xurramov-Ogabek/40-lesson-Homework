import http from 'http';
import url from 'url';

let phones = [
  { id: 1, name: "iPhone 14", brand: "Apple", price: 1200, stock: 10 },
  { id: 2, name: "Galaxy S23", brand: "Samsung", price: 900, stock: 8 },
  { id: 3, name: "Pixel 7", brand: "Google", price: 700, stock: 5 }
];

let cart = []; 

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && pathname === '/phones') {
    let result = phones;
    if (query.brand) {
      result = result.filter(phone => phone.brand === query.brand);
    }
    if (query.maxPrice) {
      result = result.filter(phone => phone.price <= parseFloat(query.maxPrice));
    }
    res.writeHead(200);
    res.end(JSON.stringify(result));

  } else if (req.method === 'GET' && pathname.startsWith('/phones/')) {
    const id = parseInt(pathname.split('/')[2]);
    const phone = phones.find(phone => phone.id === id);
    if (phone) {
      res.writeHead(200);
      res.end(JSON.stringify(phone));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Phone not found' }));
    }

  } else if (req.method === 'POST' && pathname === '/phones') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const newPhone = JSON.parse(body);
        if (!newPhone.name || !newPhone.brand || !newPhone.price || !newPhone.stock) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid phone data' }));
        } else {
          newPhone.id = phones.length + 1;
          phones.push(newPhone);
          res.writeHead(201);
          res.end(JSON.stringify(newPhone));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

  } else if (req.method === 'POST' && pathname === '/cart') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const { phoneId, quantity } = JSON.parse(body);
        const phone = phones.find(p => p.id === phoneId);
        if (!phone || phone.stock < quantity) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Insufficient stock or invalid phone ID' }));
        } else {
          phone.stock -= quantity;
          const cartItem = cart.find(item => item.phoneId === phoneId);
          if (cartItem) {
            cartItem.quantity += quantity;
            cartItem.totalPrice += phone.price * quantity;
          } else {
            cart.push({ phoneId, quantity, totalPrice: phone.price * quantity });
          }
          res.writeHead(200);
          res.end(JSON.stringify(cart));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

  } else if (req.method === 'GET' && pathname === '/cart') {
    res.writeHead(200);
    res.end(JSON.stringify(cart));

  } else if (req.method === 'DELETE' && pathname === '/cart') {
    const phoneId = parseInt(query.phoneId);
    const cartIndex = cart.findIndex(item => item.phoneId === phoneId);
    if (cartIndex === -1) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Item not found in cart' }));
    } else {
      cart.splice(cartIndex, 1);
      res.writeHead(200);
      res.end(JSON.stringify(cart));
    }

  } else if (req.method === 'POST' && pathname === '/checkout') {
    if (cart.length === 0) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Cart is empty' }));
    } else {
      cart = [];
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'Order placed successfully' }));
    }

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');//Ustoz javobi chiqishi uchun bu yerga phones deb qo'shasiz 3000ni orqasidan
});