// lib/connect.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Initializes the environment variables and the Supabase client.
Future<void> initializeSupabase() async {
  // 1. Ensure widgets are initialized first
  WidgetsFlutterBinding.ensureInitialized(); 

  // 2. Load the .env file using the registered name
  // IMPORTANT: Ensure 'connect.env' is listed in your pubspec.yaml assets!
  await dotenv.load(fileName: "connect.env"); 

  // 3. Initialize Supabase using the loaded variables
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!, 
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  );
}