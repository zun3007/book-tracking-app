# 📚 Book Tracking Application

A user-friendly web app designed to help you manage and keep track of your book collection. This application allows users to categorize books, monitor reading progress, and receive tailored recommendations. Featuring a sleek **light slate theme**, it delivers a seamless experience with modern animations and intuitive functionality.

---

## 🌟 Highlights

- **Secure Authentication**: Powered by [Supabase](https://supabase.com) for login and registration.
- **Book Categorization**: Create personalized bookshelves for better organization.
- **Recommendations**: Get reading suggestions based on your interests.
- **Progress Tracker**: Maintain your reading history and pick up where you left off.
- **Drag-and-Drop**: Easily rearrange books within shelves or lists.
- **Advanced Search**: Search books by title, author, or genre with filters.
- **Responsive Design**: Works flawlessly across devices and screen sizes.
- **Interactive Animations**: Enhanced UX with smooth motion effects using **Framer Motion**.
- **Clean Theme**: A light and elegant design for a polished interface.

---

## 🛠️ Technology Stack

### Frontend Tools

- **React** (TypeScript) - For building the user interface.
- **React Router v7** - Implements client-side routing.
- **React Query** - Manages data fetching and caching.
- **React Hook Form** - Simplifies form handling and validation.
- **Zod** - Ensures data validation in forms.
- **TailwindCSS** - Enables fast and responsive UI development.
- **Framer Motion** - Adds modern and engaging animations.

### Backend Framework

- **Supabase** - Provides database, API, and authentication as a service.

---

## 🚀 Setup Instructions

### Requirements

- [Node.js](https://nodejs.org/) and npm or [pnpm](https://pnpm.io/)
- An active Supabase project with API credentials.

### Steps to Install

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/book-tracking-app.git
   ```
2. Navigate to the project directory:
   ```bash
   cd book-tracking-app
   ```
3. Install all necessary dependencies:
   ```bash
   pnpm install
   ```
4. Configure Supabase:
   - Create a `.env` file in the root directory.
   - Add the following keys:
     ```
     VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
     VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

### Run the Development Server

1. Start the server locally:
   ```bash
   pnpm dev
   ```
2. Access the application at [http://localhost:5173](http://localhost:5173).

---

## 📂 Project Structure

```
src/
├── components/        # Shared components (e.g., Navbar, Footer)
├── pages/             # Application pages (SignIn, Dashboard, etc.)
├── ui/                # UI-specific elements (e.g., InputForm, buttons)
├── utils/             # Utility files (e.g., Supabase client, AuthContext)
├── styles/            # Global CSS and Tailwind configuration
├── App.tsx            # Main application entry point
├── main.tsx           # React entry point
```

---

## 🛡️ Security and Validation

- **User Authentication**: Relies on Supabase for secure user accounts.
- **Input Validation**: Utilizes Zod to ensure accurate data submission.

---

## 🧪 Testing

### Unit Testing

Execute tests for reliability and performance:

```bash
pnpm test
```

### Linting and Code Formatting

Ensure clean, maintainable code:

```bash
pnpm lint
pnpm format
```

---

## 🤝 Contributing Guidelines

We welcome contributions to improve this project!

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Describe your changes"
   ```
4. Push your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

---

## 👩‍💻 Author

- **Zun3007** - [GitHub Profile](https://github.com/zun3007)
