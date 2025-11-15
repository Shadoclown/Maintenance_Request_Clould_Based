// lib/connect.dart

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> initializeSupabase() async {
  WidgetsFlutterBinding.ensureInitialized(); 

  // Use the exact filename you created
  await dotenv.load(fileName: "connect.env"); 

  // Initialize Supabase as before
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!, 
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  );
}