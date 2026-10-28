# CalifncoPurifierApp

A React Native application built with Expo for a water purifier business. The app is designed to help customers browse products, manage their cart, place orders, and explore services, with separate functionality for dealers and administrators.

## Features

- **User Authentication:** Firebase Authentication integration.
- **Product Catalog:** Browse available water purifier products.
- **Shopping Cart:** Add and manage products before checkout.
- **Order Management:** Place orders through the app.
- **Dealer Portal:** Access dealer-focused wholesale pricing.
- **Services:** Explore water purifier service options.
- **Admin Dashboard:** Administrative interface for managing app operations.
- **Cloud Database:** Firebase Firestore integration.
- **Persistent Authentication:** AsyncStorage-based authentication persistence.
- **Cross-Platform Foundation:** Built with React Native and Expo.

## Tech Stack

- React Native
- Expo
- TypeScript
- JavaScript
- Firebase Authentication
- Cloud Firestore
- AsyncStorage
- HTML, CSS and JavaScript fundamentals

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js (LTS version recommended)
- npm
- Expo Go on a compatible mobile device, or an Android development environment

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sameekhann/CalifncoPurifierApp.git
   ```

2. Open the project directory:

   ```bash
   cd CalifncoPurifierApp
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the Expo development server:

   ```bash
   npx expo start
   ```

5. Follow the terminal instructions to open the app using Expo Go or an available emulator.

## Firebase Configuration

This project uses Firebase Authentication and Cloud Firestore.

Before running the application, configure a Firebase project and ensure that the app's Firebase configuration matches your project. Configure authentication providers, Firestore security rules, and any required platform settings.

**Security:** Never commit Firebase Admin service-account credentials, private keys, access tokens, or other secrets to the repository. Apply appropriate API restrictions and database security rules.

## Project Structure

```text
CalifncoPurifierApp/
├── assets/             # App images and icons
├── App.tsx             # Main application component
├── AuthScreen.tsx      # Authentication screen
├── firebaseConfig.js   # Firebase initialization
├── index.ts            # Application entry point
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── package-lock.json   # Dependency lockfile
├── tsconfig.json       # TypeScript configuration
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## Future Improvements

- Integrate a payment gateway.
- Add order tracking and notifications.
- Improve administrative management tools.
- Add additional testing and production deployment workflows.
- Strengthen configuration management and security.

## Author

**Samee Khan**

GitHub: [@sameekhann](https://github.com/sameekhann)

## License

See the [LICENSE](LICENSE) file for licensing information.
