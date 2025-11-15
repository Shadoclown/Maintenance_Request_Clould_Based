// lib/login_page.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'main.dart'; 

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  // State variables to hold the fetched test credentials
  String testEmail = 'Fetching...';
  String testPassword = '...';

  @override
  void initState() {
    super.initState();
    // Fetch the test credentials as soon as the widget is created
    _fetchTestCredentials();
  }

  /// Fetches the first email and password record from the 'users' table
  Future<void> _fetchTestCredentials() async {
    try {
      // 1. Get the Supabase client instance
      final supabase = Supabase.instance.client;

      // 2. Query the 'users' table, selecting the 'mail' and 'password' columns
      // We limit to 1 row for quick testing purposes.
      final List<Map<String, dynamic>> response = await supabase
          .from('users')
          .select('mail, password')
          .limit(1);

      // 3. Update the state with the fetched data
      if (response.isNotEmpty) {
        final data = response[0];
        setState(() {
          // Use 'mail' as per your Supabase table schema
          testEmail = data['mail'] ?? 'N/A'; 
          testPassword = data['password'] ?? 'N/A';
        });
      } else {
        setState(() {
          testEmail = 'Table is empty';
          testPassword = 'N/A';
        });
      }
    } catch (e) {
      // Handle any errors during fetching (e.g., network error, RLS policy)
      print('Error fetching test credentials: $e');
      setState(() {
        testEmail = 'Error fetching data';
        testPassword = 'Check RLS/Network';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              // --- Email Field ---
              const TextField(
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.email),
                ),
              ),
              const SizedBox(height: 16.0),

              // --- Password Field ---
              const TextField(
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
              ),
              const SizedBox(height: 24.0),

              // --- Login Button ---
              ElevatedButton(
                onPressed: () {
                  // Navigate to the Home Page
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (context) => MyHomePage(title: 'App Home Page'),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                  textStyle: const TextStyle(fontSize: 18),
                ),
                child: const Text('Sign In'),
              ),
              
              const SizedBox(height: 40.0), // Spacer

              // --- Fetched Test Credentials Display (Bottom Middle) ---
              const Divider(),
              const Text(
                'TEST CREDENTIALS (from Supabase "users" table)',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 10),
              ),
              const SizedBox(height: 8),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Email: ', style: TextStyle(fontWeight: FontWeight.w500)),
                  Text(testEmail, style: const TextStyle(fontFamily: 'monospace', color: Colors.blue)),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Password: ', style: TextStyle(fontWeight: FontWeight.w500)),
                  Text(testPassword, style: const TextStyle(fontFamily: 'monospace', color: Colors.blue)),
                ],
              ),
              const Divider(),
            ],
          ),
        ),
      ),
    );
  }
}