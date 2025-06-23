# Notionary - Modern Notes App

A full-featured, modern notes application built with Next.js 15, featuring authentication, workspaces, groups, and intuitive drag-and-drop functionality.

## 🚀 Features

### Core Features
- **Authentication**: Google OAuth and email/password authentication
- **Workspaces**: Create and manage multiple workspaces
- **Notes**: Create, edit, and organize notes with rich text editing
- **Groups**: Drag and drop notes to create groups
- **Drag & Drop**: Intuitive smartphone-like drag and drop interface
- **Real-time Updates**: Instant state synchronization
- **Responsive Design**: Works seamlessly on desktop and mobile

### Advanced Features
- **Group Management**: 
  - Drag notes to create groups
  - Drag notes out of groups to ungroup
  - Drag entire groups into other groups
  - Automatic group disbanding when only one note remains
- **Workspace Management**:
  - Create custom workspaces with emoji icons
  - Switch between workspaces seamlessly
  - Default workspace for new users
- **Modern UI/UX**:
  - Glassmorphism design
  - Dark/Light mode toggle
  - Smooth animations and transitions
  - Futuristic styling

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **State Management**: React Hooks (useState, useCallback, useMemo)
- **Drag & Drop**: React Beautiful DnD
- **Rich Text Editor**: Custom implementation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hkhalid1995/notionary.git
   cd notionary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
6. Copy the Client ID and Client Secret to your `.env.local` file

### Database Configuration
The app uses SQLite by default. To use a different database:
1. Update the `DATABASE_URL` in your `.env.local` file
2. Run `npx prisma db push` to apply migrations

## 📱 Usage

### Getting Started
1. **Sign Up/In**: Use Google OAuth or create an account with email/password
2. **Create Workspace**: Click the workspace dropdown to create a new workspace
3. **Add Notes**: Click the "+" button to create new notes
4. **Organize**: Drag notes together to create groups

### Drag & Drop Features
- **Create Groups**: Drag one note on top of another to create a group
- **Ungroup Notes**: Drag notes out of groups to ungroup them
- **Group to Group**: Drag entire groups into other groups
- **Reorder**: Drag groups to reorder them

### Workspace Management
- **Switch Workspaces**: Use the dropdown in the navigation bar
- **Create Workspace**: Click "Create Workspace" in the dropdown
- **Delete Workspace**: Use the workspace settings (default workspace cannot be deleted)

## 🏗️ Project Structure

```
notes-app/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── groups/    # Group management
│   │   │   ├── notes/     # Note management
│   │   │   └── workspaces/ # Workspace management
│   │   ├── auth/          # Authentication pages
│   │   ├── components/    # React components
│   │   ├── dashboard/     # Main dashboard
│   │   └── globals.css    # Global styles
│   ├── lib/               # Utility libraries
│   ├── navigation/        # Navigation components
│   ├── screens/           # Screen components
│   └── utils/             # Utility functions
├── .env.local             # Environment variables
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/session` - Get current session

### Workspaces
- `GET /api/workspaces` - Get user workspaces
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/[id]` - Update workspace
- `DELETE /api/workspaces/[id]` - Delete workspace

### Notes
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### Groups
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create group
- `PUT /api/groups/[id]` - Update group
- `DELETE /api/groups/[id]` - Delete group

## 🎨 Customization

### Styling
The app uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Global styles in `src/app/globals.css`
- Component-specific styles in individual component files

### Themes
The app supports dark and light modes. Theme switching is handled by the `ThemeProvider` component.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Vercel team for the deployment platform
- Tailwind CSS team for the utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/Hkhalid1995/notionary/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Made with ❤️ by [Hamza Khalid](https://github.com/Hkhalid1995)**
