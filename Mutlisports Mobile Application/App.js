
// import React, { useEffect, useState } from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Import all screens
// import SignIn from './src/screens/auth/signin';
// import SignUp from './src/screens/auth/signup';

// // User Screens
// import Home from './src/screens/home/Home';
// import MyBooking from './src/screens/bookings/MyBooking';
// import Settings from './src/screens/settings/Settings';
// import BookNow from './src/screens/booking/BookNow';
// import Payment from './src/screens/payment/Payment';
// import VenueDetails from './src/screens/booking/VenueDetails';

// // Vendor Screens
// import VendorDashboard from './src/screens/vendor/VendorDashboard';
// import ManageVenues from './src/screens/vendor/ManageVenues';
// import AddVenue from './src/screens/vendor/AddVenue';
// import EditVenue from './src/screens/vendor/EditVenue';
// import ManageSlots from './src/screens/vendor/ManageSlots';
// import VendorBookings from './src/screens/vendor/VendorBookings';
// import VendorPayments from './src/screens/vendor/VendorPayments';

// // Admin Screens
// import AdminDashboard from './src/screens/admin/AdminDashboard';
// import ManageUsers from './src/screens/admin/ManageUsers';
// import ManagePendingVenues from './src/screens/admin/ManagePendingVenues';
// import AdminBookings from './src/screens/admin/AdminBookings';
// import AdminCategories from './src/screens/admin/AdminCategories';


// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkUserRole();
//   }, []);

//   const checkUserRole = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('userData');
//       if (userData) {
//         const user = JSON.parse(userData);
//         setUserRole(user.role);
//       } else {
//         setUserRole(null);
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error('Error checking user role:', error);
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return null; // Or show a splash screen
//   }

//   return (
//     <NavigationContainer>
//       <StatusBar style="auto" />
//       <Stack.Navigator
//         initialRouteName={userRole ? 'RoleBasedHome' : 'SignIn'}
//         screenOptions={{
//           headerShown: false,
//           animation: 'slide_from_right',
//         }}
//       >
//         {/* Auth Screens */}
//         <Stack.Screen
//           name="SignIn"
//           component={SignIn}
//           options={{ animationEnabled: false }}
//           listeners={() => ({
//             focus: () => {
//               checkUserRole();
//             },
//           })}
//         />
//         <Stack.Screen name="SignUp" component={SignUp} />

//         {/* Dummy screen for role-based navigation */}
//         {userRole === 'USER' && (
//           <>
//             <Stack.Screen name="RoleBasedHome" component={Home} />
//             <Stack.Screen name="Home" component={Home} />
//             <Stack.Screen name="MyBooking" component={MyBooking} />
//             <Stack.Screen name="Settings" component={Settings} />
//             <Stack.Screen name="VenueDetails" component={VenueDetails} />
//             <Stack.Screen name="BookNow" component={BookNow} />
//             <Stack.Screen name="Payment" component={Payment} />
//           </>
//         )}

//         {userRole === 'VENDOR' && (
//           <>
//             <Stack.Screen name="RoleBasedHome" component={VendorDashboard} />
//             <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
//             <Stack.Screen name="ManageVenues" component={ManageVenues} />
//             <Stack.Screen name="AddVenue" component={AddVenue} />
//             <Stack.Screen name="EditVenue" component={EditVenue} />
//             <Stack.Screen name="ManageSlots" component={ManageSlots} />
//             <Stack.Screen name="VendorBookings" component={VendorBookings} />
//             <Stack.Screen name="VendorPayments" component={VendorPayments} />
//             <Stack.Screen name="Settings" component={Settings} />
//             <Stack.Screen name="VenueDetails" component={VenueDetails} />
//           </>
//         )}

//         {userRole === 'ADMIN' && (
//           <>
//             <Stack.Screen name="RoleBasedHome" component={AdminDashboard} />
//             <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//             <Stack.Screen name="ManageUsers" component={ManageUsers} />
//             <Stack.Screen name="ManagePendingVenues" component={ManagePendingVenues} />
//             <Stack.Screen name="AdminBookings" component={AdminBookings} />
//             <Stack.Screen name="AdminCategories" component={AdminCategories} />
//             <Stack.Screen name="Settings" component={Settings} />
//           </>
//         )}

//         {!userRole && (
//           <>
//             <Stack.Screen name="Home" component={Home} />
//             <Stack.Screen name="MyBooking" component={MyBooking} />
//             <Stack.Screen name="Settings" component={Settings} />
//             <Stack.Screen name="VenueDetails" component={VenueDetails} />
//             <Stack.Screen name="BookNow" component={BookNow} />
//             <Stack.Screen name="Payment" component={Payment} />
//             <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
//             <Stack.Screen name="ManageVenues" component={ManageVenues} />
//             <Stack.Screen name="AddVenue" component={AddVenue} />
//             <Stack.Screen name="ManageSlots" component={ManageSlots} />
//             <Stack.Screen name="VendorBookings" component={VendorBookings} />
//             <Stack.Screen name="VendorPayments" component={VendorPayments} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all screens
import SignIn from './src/screens/auth/signin';
import SignUp from './src/screens/auth/signup';

// User Screens
import Home from './src/screens/home/Home';
import MyBooking from './src/screens/bookings/MyBooking';
import Settings from './src/screens/settings/Settings';
import BookNow from './src/screens/booking/BookNow';
import Payment from './src/screens/payment/Payment';
import VenueDetails from './src/screens/booking/VenueDetails';

// Vendor Screens
import VendorDashboard from './src/screens/vendor/VendorDashboard';
import ManageVenues from './src/screens/vendor/ManageVenues';
import AddVenue from './src/screens/vendor/AddVenue';
import EditVenue from './src/screens/vendor/EditVenue';
import ManageSlots from './src/screens/vendor/ManageSlots';
import VendorBookings from './src/screens/vendor/VendorBookings';
import VendorPayments from './src/screens/vendor/VendorPayments';

// Admin Screens
import AdminDashboard from './src/screens/admin/AdminDashboard';
import ManageUsers from './src/screens/admin/ManageUsers';
import ManagePendingVenues from './src/screens/admin/ManagePendingVenues';
import AdminBookings from './src/screens/admin/AdminBookings';
import AdminCategories from './src/screens/admin/AdminCategories';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking user role:', error);
      setLoading(false);
    }
  };

  // Function to get initial route based on role
  const getInitialRoute = () => {
    if (!userRole) return 'SignIn';
    if (userRole === 'ADMIN') return 'AdminDashboard';
    if (userRole === 'VENDOR') return 'VendorDashboard';
    return 'Home';
  };

  if (loading) {
    return null; // Or show a splash screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Auth Screens - Always available */}
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{ animationEnabled: false }}
          listeners={{
            focus: () => {
              checkUserRole();
            },
          }}
        />
        <Stack.Screen name="SignUp" component={SignUp} />

        {/* User Screens */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="MyBooking" component={MyBooking} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="VenueDetails" component={VenueDetails} />
        <Stack.Screen name="BookNow" component={BookNow} />
        <Stack.Screen name="Payment" component={Payment} />

        {/* Vendor Screens */}
        <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
        <Stack.Screen name="ManageVenues" component={ManageVenues} />
        <Stack.Screen name="AddVenue" component={AddVenue} />
        <Stack.Screen name="EditVenue" component={EditVenue} />
        <Stack.Screen name="ManageSlots" component={ManageSlots} />
        <Stack.Screen name="VendorBookings" component={VendorBookings} />
        <Stack.Screen name="VendorPayments" component={VendorPayments} />

        {/* Admin Screens */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="ManageUsers" component={ManageUsers} />
        <Stack.Screen name="ManagePendingVenues" component={ManagePendingVenues} />
        <Stack.Screen name="AdminBookings" component={AdminBookings} />
        <Stack.Screen name="AdminCategories" component={AdminCategories} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}