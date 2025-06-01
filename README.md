# 💬 Hygh Discussions

A modern, real-time discussion platform built with **React**, **TypeScript**, **Tailwind CSS**, and **Redis**. Hygh Discussions offers a sleek interface and robust backend, making it ideal for forums, Q&A platforms, or community chat applications.

---

## 🚀 Features

- ⚡ **Real-Time Communication**: Leveraging Redis for instant message delivery.
- 🎨 **Responsive UI**: Built with Tailwind CSS for a clean and adaptable design.
- 🛠️ **TypeScript Support**: Ensures type safety across the codebase.
- 🔧 **Modular Architecture**: Organized into `client`, `server`, and `shared` directories for scalability.
- 🌐 **Vite-Powered**: Fast development and optimized builds.

---

## 📁 Project Structure

```
Hygh-Discussions/
├── client/       # Frontend React application
├── server/       # Backend server with Redis integration
├── shared/       # Shared utilities and types
├── components.json
├── drizzle.config.ts
├── tailwind.config.ts
├── vite.config.ts
└── ...
```

---

## 🛠️ Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Redis](https://redis.io/) (for real-time features)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/deebehygh/Hygh-Discussions.git
   cd Hygh-Discussions
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Redis Server**

   Ensure Redis is running on its default port (`6379`). You can start Redis with:

   ```bash
   redis-server
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

   The application should now be accessible at `http://localhost:3000`.

---

## ⚙️ Configuration

- **Tailwind CSS**: Customize styles in `tailwind.config.ts`.
- **Vite**: Adjust build and development settings in `vite.config.ts`.
- **Drizzle**: Manage database configurations in `drizzle.config.ts`.

---

## 💡 Customization Tips

- **Theme Colors**: Modify `tailwind.config.ts` to change the color scheme.
- **Components**: Update or add new components in the `client` directory to extend functionality.
- **Shared Types**: Define and manage TypeScript types in the `shared` directory for consistency.

---

## 📸 Screenshots

*Include screenshots here to showcase the UI.*

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 📬 Contact

For questions or feedback, please open an issue or reach out to [@deebehygh](https://github.com/deebehygh).
