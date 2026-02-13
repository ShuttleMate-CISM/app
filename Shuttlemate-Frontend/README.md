# ShuttleMate

ShuttleMate is a web application designed to manage and facilitate badminton-related activities, including booking courts, scheduling matches, managing coaches, handling payments, and more.

## Features
- User authentication and role-based access
- Court booking and availability management
- Coach management and scheduling
- Match timeline and details
- News and updates section
- Shop for badminton items
- Video gallery and uploads
- Payment management

## Technologies Used
- React.js (Frontend)
- Vite (Build tool)
- Tailwind CSS (Styling)
- Firebase (Authentication & Database)

## Project Structure
```
ShuttleMate/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── firebase/
│   ├── hooks/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── README.md
```

## Getting Started
1. **Clone the repository:**
   ```powershell
   git clone https://github.com/HimashaKodikara/ShuttleMate.git
   ```
2. **Install dependencies:**
   ```powershell
   cd ShuttleMate
   npm install
   ```
3. **Start the development server:**
   ```powershell
   npm run dev
   ```
4. **Open in browser:**
   Visit `http://localhost:5173` (or the port shown in your terminal).

## Configuration
- **Firebase:**
  - Update `src/firebase/firebaseconfig.jsx` with your Firebase project credentials.
- **Environment Variables:**
  - Add any required environment variables in a `.env` file at the root.

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
