# PMP Practice Test Application

A free, open-source static web application for PMP (Project Management Professional) certification exam preparation. Practice tests and flashcards with local progress tracking. No account required - all data stays on your device.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Open Source](https://img.shields.io/badge/Open%20Source-❤️-brightgreen)
![Static Site](https://img.shields.io/badge/Static%20Site-🎉-blue)

## 🎁 Support This Project

This tool is completely free and open source. If you find it helpf

- [**GitHub Sponsors**](https://github.com/sponsors/dustinober) - Monthly donations
- [**Buy Me a Coffee**](https://www.buymeacoffee.com/dustinober) - One-time donations

Your support helps maintain and improve this resource for PMP aspirants worldwide! 🙏

## 🎯 Features

### 📝 Practice Tests
- Full-length 180-question practice exams
- Domain-specific practice tests (People, Process, Business)
- Question flagging for review
- Detailed explanations for all answers
- Progress tracking stored locally

### 🧠 Flashcards
- Spaced repetition system with local review tracking
- Confidence ratings: Again, Hard, Good, Easy
- Category and domain filtering
- Progress saved in your browser

### 💾 Local Data Storage
- No account required - everything stays on your device
- Progress persists between sessions
- Privacy-first: no data sent to servers
- Works offline once loaded

### 📱 Mobile Friendly
- Responsive design for all devices
- Touch-optimized interface
- Works on phones, tablets, and desktops

## 🚀 Access the Application

The PMP Practice Test Application is available online at:

**[https://dustinober1.github.io/pmp_application/](https://dustinober1.github.io/pmp_application/)**

### Features
- ✅ Completely free to use
- ✅ No registration required
- ✅ Works offline after initial load
- ✅ All progress saved locally in your browser

### For Developers

To run locally or contribute:

```bash
# Clone the repository
git clone https://github.com/dustinober1/pmp_application.git
cd pmp_application

# Install frontend dependencies
cd client/client
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

```bash
cd client/client
npm run build
```

The built files will be in `client/client/dist/` and can be served by any static hosting service.

Legacy backend code, historical CI workflows, and raw data exports are archived under `archive/legacy-backend/`.

## 📁 Project Structure

```
pmp_application/
├── archive/legacy-backend/ # Legacy backend code and tooling (archived)
├── client/client/          # React frontend (Vite)
│   ├── public/
│   │   ├── data/           # Question and flashcard JSON data
│   │   └── ...             # Other static assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── services/       # Data loading services
│       └── styles/         # CSS stylesheets
├── .github/workflows/      # GitHub Actions for deployment
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Development Guidelines
- Run tests before submitting PRs
- Follow existing code patterns
- Add tests for new features
- Update documentation as needed

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgements

- PMP exam content based on PMBOK Guide 7th Edition
- SM-2 Algorithm by Piotr Wozniak
- Icons from Heroicons
- Built with React, TypeScript, and Vite
