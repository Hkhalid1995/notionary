import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Gradients } from '../utils/colors';
import { Spacing, BorderRadius, FontSizes, CommonStyles } from '../utils/styles';

interface SignInScreenProps {
  navigation: any;
}

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication - replace with actual auth logic
    setTimeout(() => {
      // Store authentication state
      // AsyncStorage.setItem('isAuthenticated', 'true');
      // AsyncStorage.setItem('userEmail', email);
      
      navigation.navigate('Dashboard');
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialAuth = (provider: 'google' | 'linkedin') => {
    setIsLoading(true);
    
    // Simulate social authentication
    setTimeout(() => {
      navigation.navigate('Dashboard');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Notionary</Text>
          <Text style={styles.subtitle}>Mobile Notes & Tasks</Text>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to your notes account</Text>
        </View>

        {/* Sign In Form */}
        <View style={[CommonStyles.card, styles.formCard]}>
          {/* Social Authentication */}
          <View style={styles.socialSection}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialAuth('google')}
              disabled={isLoading}
            >
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialAuth('linkedin')}
              disabled={isLoading}
            >
              <Text style={styles.socialButtonText}>Continue with LinkedIn</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[CommonStyles.input, styles.input]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[CommonStyles.input, styles.input]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Options */}
          <View style={styles.optionsSection}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setKeepSignedIn(!keepSignedIn)}
          >
            <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]} />
            <Text style={styles.checkboxText}>Keep me signed in for 30 days</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[CommonStyles.button, styles.signInButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpSection}>
            <Text style={styles.signUpText}>
              Don't have an account?{' '}
              <Text
                style={styles.signUpLink}
                onPress={() => navigation.navigate('SignUp')}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.container,
  },
  
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.md,
  },
  
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...CommonStyles.shadow,
  },
  
  logo: {
    fontSize: FontSizes.heading,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.primaryLight,
    marginTop: Spacing.xs,
  },
  
  welcomeSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  welcomeTitle: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  
  welcomeSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  
  formCard: {
    marginBottom: Spacing.lg,
  },
  
  socialSection: {
    marginBottom: Spacing.lg,
  },
  
  socialButton: {
    ...CommonStyles.button,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  
  socialButtonText: {
    fontSize: FontSizes.md,
    color: Colors.textDark,
    fontWeight: '500',
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  
  inputGroup: {
    marginBottom: Spacing.md,
  },
  
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: Spacing.xs,
  },
  
  input: {
    height: 48,
  },
  
  optionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  checkboxText: {
    fontSize: FontSizes.sm,
    color: Colors.textDark,
  },
  
  forgotText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  
  signInButton: {
    backgroundColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  
  signInButtonText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.white,
  },
  
  signUpSection: {
    alignItems: 'center',
  },
  
  signUpText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  
  signUpLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
}); 