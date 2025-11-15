import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'package:flutter/material.dart';
import 'connect.dart'; 

void main() async {
  await initializeSupabase(); 

  runApp(const MaintenanceApp());
}

// -------------------- ENUMS AND MODELS --------------------
enum UserRole { user, staff, admin }

enum Specialist { technician, plumber, electrician, itSupport }

extension SpecialistExtension on Specialist {
  String get displayName {
    switch (this) {
      case Specialist.technician:
        return 'Technician';
      case Specialist.plumber:
        return 'Plumber';
      case Specialist.electrician:
        return 'Electrician';
      case Specialist.itSupport:
        return 'IT Support';
    }
  }
}

class MaintenanceRequest {
  final String description;
  final String location;
  String status;
  final List<String> imagePaths;
  final List<Uint8List> imageBytes; // Store image bytes for web compatibility
  final DateTime timestamp;
  String? assignedStaffId;
  Specialist? assignedSpecialist;

  MaintenanceRequest({
    required this.description,
    required this.location,
    this.status = 'Pending',
    required this.imagePaths,
    this.imageBytes = const [],
    DateTime? timestamp,
    this.assignedStaffId,
    this.assignedSpecialist,
  }) : timestamp = timestamp ?? DateTime.now();
}

// Global data store (will be replaced with AWS backend)
class DataStore {
  static List<MaintenanceRequest> requests = [];
  static Map<String, Specialist> staffSpecialists = {};
}

class MaintenanceApp extends StatelessWidget {
  const MaintenanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Maintenance Request and Complaint Management System',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const LoginPage(),
    );
  }
}

// -------------------- LOGIN PAGE --------------------
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;

  void _login() {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    // TODO: Replace with AWS IAM authentication
    // For now, mock role assignment based on email
    UserRole role;
    Specialist? staffSpecialist;

    if (email.contains('admin')) {
      role = UserRole.admin;
    } else if (email.contains('staff')) {
      role = UserRole.staff;
      // Mock staff specialist assignment
      if (email.contains('technician')) {
        staffSpecialist = Specialist.technician;
      } else if (email.contains('plumber')) {
        staffSpecialist = Specialist.plumber;
      } else if (email.contains('electrician')) {
        staffSpecialist = Specialist.electrician;
      } else if (email.contains('it')) {
        staffSpecialist = Specialist.itSupport;
      } else {
        staffSpecialist = Specialist.technician;
      }
      DataStore.staffSpecialists[email] = staffSpecialist;
    } else {
      role = UserRole.user;
    }

    // Navigate based on role
    Widget destination;
    switch (role) {
      case UserRole.user:
        destination = const UserPage();
        break;
      case UserRole.staff:
        destination = StaffPage(staffEmail: email, specialist: staffSpecialist!);
        break;
      case UserRole.admin:
        destination = const AdminPage();
        break;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => destination),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.build_circle,
                size: 100,
                color: Colors.blue,
              ),
              const SizedBox(height: 20),
              const Text(
                'Maintenance Request System',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              const Text(
                'Please login to continue',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 40),
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility : Icons.visibility_off,
                    ),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _login,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: const Text(
                  'Login',
                  style: TextStyle(fontSize: 18),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'email สำหรับ login\npassword ใส่อะไรก็ได้:\nUser : user@example.com\nTechnicians : taff-technician@example.com\nPlumber : staff-plumber@example.com\nElectrician : staff-electrician@example.com\nIt : staff-it@example.com\n admin : admin@example.com',
                style: TextStyle(fontSize: 12, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// -------------------- 🧍 USER PAGE --------------------
class UserPage extends StatefulWidget {
  const UserPage({super.key});

  @override
  State<UserPage> createState() => _UserPageState();
}

class _UserPageState extends State<UserPage> {
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final List<XFile> _selectedImages = [];
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    if (_selectedImages.length >= 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Maximum 3 images allowed')),
      );
      return;
    }

    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );

    if (image != null) {
      // Check both MIME type and file extension
      final mimeType = image.mimeType?.toLowerCase() ?? '';
      final extension = image.path.split('.').last.toLowerCase();

      final isValidMimeType = mimeType.contains('image/png') ||
                              mimeType.contains('image/jpeg') ||
                              mimeType.contains('image/jpg');
      final isValidExtension = extension == 'png' ||
                               extension == 'jpg' ||
                               extension == 'jpeg';

      // Accept if either MIME type or extension is valid
      if (isValidMimeType || isValidExtension) {
        setState(() {
          _selectedImages.add(image);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Image added successfully! (${_selectedImages.length}/3)')),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Only PNG and JPEG images are allowed. Selected: $extension'),
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<void> _submitRequest() async {
    final desc = _descriptionController.text.trim();
    final loc = _locationController.text.trim();

    if (desc.isEmpty || loc.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    // Read all image bytes for web compatibility
    final List<Uint8List> bytes = [];
    for (var img in _selectedImages) {
      try {
        final data = await img.readAsBytes();
        bytes.add(data);
      } catch (e) {
        // If reading fails, skip this image
        print('Error reading image: $e');
      }
    }

    final request = MaintenanceRequest(
      description: desc,
      location: loc,
      imagePaths: _selectedImages.map((img) => img.path).toList(),
      imageBytes: bytes,
    );

    setState(() {
      DataStore.requests.add(request);
    });

    _descriptionController.clear();
    _locationController.clear();
    _selectedImages.clear();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Request submitted successfully!')),
      );
    }
  }

  void _goToHistoryPage() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ProgressHistoryPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Page'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginPage()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Submit Request',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Location',
                border: OutlineInputBorder(),
                hintText: 'e.g., Library, Lab Room 101, Lecture Hall A',
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Attach Images (Max 3, PNG/JPEG only)',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ..._selectedImages.asMap().entries.map((entry) {
                  return Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: FutureBuilder<Uint8List>(
                          future: entry.value.readAsBytes(),
                          builder: (context, snapshot) {
                            if (snapshot.hasData) {
                              return Image.memory(
                                snapshot.data!,
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                              );
                            }
                            return Container(
                              width: 100,
                              height: 100,
                              color: Colors.grey[300],
                              child: const Center(
                                child: CircularProgressIndicator(),
                              ),
                            );
                          },
                        ),
                      ),
                      Positioned(
                        top: 0,
                        right: 0,
                        child: IconButton(
                          icon: const Icon(Icons.cancel, color: Colors.red),
                          onPressed: () => _removeImage(entry.key),
                        ),
                      ),
                    ],
                  );
                }),
                if (_selectedImages.length < 3)
                  InkWell(
                    onTap: _pickImage,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.add_photo_alternate, size: 40),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.send),
              label: const Text('Submit Request'),
              onPressed: _submitRequest,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
              ),
            ),
            const SizedBox(height: 40),
            const Divider(thickness: 1),
            const SizedBox(height: 16),
            const Text(
              'View Request History',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(Icons.history),
              label: const Text('View Request History'),
              onPressed: _goToHistoryPage,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 48),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------- 📋 HISTORY PAGE --------------------
class ProgressHistoryPage extends StatelessWidget {
  const ProgressHistoryPage({super.key});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Done':
        return Colors.green;
      case 'In Progress':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request History')),
      body: DataStore.requests.isEmpty
          ? const Center(child: Text('No requests submitted yet.'))
          : ListView.builder(
              itemCount: DataStore.requests.length,
              itemBuilder: (context, index) {
                final request = DataStore.requests[index];
                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: ExpansionTile(
                    title: Text(request.description),
                    subtitle: Text('Location: ${request.location}'),
                    trailing: Text(
                      request.status,
                      style: TextStyle(
                        color: _getStatusColor(request.status),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    children: [
                      if (request.imageBytes.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: request.imageBytes.map((bytes) {
                              return ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.memory(
                                  bytes,
                                  width: 100,
                                  height: 100,
                                  fit: BoxFit.cover,
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}

// -------------------- 🛠️ STAFF PAGE --------------------
class StaffPage extends StatefulWidget {
  final String staffEmail;
  final Specialist specialist;

  const StaffPage({
    super.key,
    required this.staffEmail,
    required this.specialist,
  });

  @override
  State<StaffPage> createState() => _StaffPageState();
}

class _StaffPageState extends State<StaffPage> {
  final List<String> statusOptions = ['Pending', 'In Progress', 'Done'];
  final Map<String, bool> expanded = {
    'Pending': true,
    'In Progress': true,
    'Done': true,
  };

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Done':
        return Colors.green;
      case 'In Progress':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  List<MaintenanceRequest> get _filteredRequests {
    return DataStore.requests
        .where((req) => req.assignedSpecialist == widget.specialist)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Staff - ${widget.specialist.displayName}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginPage()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: ['Pending', 'In Progress', 'Done'].map((status) {
            final filtered =
                _filteredRequests.where((r) => r.status == status).toList();
            return ExpansionTile(
              title: Text(
                status,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: _getStatusColor(status),
                ),
              ),
              initiallyExpanded: expanded[status] ?? true,
              onExpansionChanged: (isOpen) {
                setState(() => expanded[status] = isOpen);
              },
              children: filtered.isEmpty
                  ? [
                      ListTile(
                        title: Text(
                          'No requests',
                          style: TextStyle(color: _getStatusColor(status)),
                        ),
                      ),
                    ]
                  : filtered.map((req) {
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Description:',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(req.description),
                                      ],
                                    ),
                                  ),
                                  DropdownButton<String>(
                                    value: req.status,
                                    onChanged: (value) {
                                      setState(() {
                                        req.status = value!;
                                      });
                                    },
                                    items: statusOptions
                                        .map(
                                          (s) => DropdownMenuItem(
                                            value: s,
                                            child: Text(
                                              s,
                                              style: TextStyle(
                                                color: _getStatusColor(s),
                                              ),
                                            ),
                                          ),
                                        )
                                        .toList(),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'Location:',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(req.location),
                              const SizedBox(height: 12),
                              if (req.imageBytes.isNotEmpty) ...[
                                const Text(
                                  'Images:',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: req.imageBytes.map((bytes) {
                                    return ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.memory(
                                        bytes,
                                        width: 100,
                                        height: 100,
                                        fit: BoxFit.cover,
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ],
                              const SizedBox(height: 8),
                              Text(
                                'Submitted: ${req.timestamp.toString().split('.')[0]}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
            );
          }).toList(),
        ),
      ),
    );
  }
}

// -------------------- 👑 ADMIN PAGE --------------------
class AdminPage extends StatefulWidget {
  const AdminPage({super.key});

  @override
  State<AdminPage> createState() => _AdminPageState();
}

class _AdminPageState extends State<AdminPage> {
  List<MaintenanceRequest> get _unassignedRequests {
    return DataStore.requests.where((req) => req.assignedStaffId == null).toList();
  }

  List<MaintenanceRequest> get _assignedRequests {
    return DataStore.requests.where((req) => req.assignedStaffId != null).toList();
  }

  void _assignRequest(MaintenanceRequest request, Specialist specialist) {
    setState(() {
      request.assignedSpecialist = specialist;
      // Set a placeholder for assignedStaffId to mark as assigned
      request.assignedStaffId = 'department:${specialist.name}';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Request assigned to ${specialist.displayName} Department',
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Done':
        return Colors.green;
      case 'In Progress':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginPage()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Unassigned Requests',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _unassignedRequests.isEmpty
                ? const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('No unassigned requests'),
                    ),
                  )
                : Column(
                    children: _unassignedRequests.map((request) {
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ExpansionTile(
                          title: Text(request.description),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Location: ${request.location}'),
                              Text(
                                'Submitted: ${request.timestamp.toString().split('.')[0]}',
                                style: const TextStyle(fontSize: 12),
                              ),
                            ],
                          ),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.orange.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'Unassigned',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.orange,
                              ),
                            ),
                          ),
                          children: [
                            if (request.imageBytes.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: request.imageBytes.map((bytes) {
                                    return ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.memory(
                                        bytes,
                                        width: 100,
                                        height: 100,
                                        fit: BoxFit.cover,
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Assign to Department:',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  const SizedBox(height: 12),
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: Specialist.values.map((specialist) {
                                      // Count staff in this department
                                      final staffCount = DataStore.staffSpecialists.values
                                          .where((s) => s == specialist)
                                          .length;

                                      return ElevatedButton(
                                        onPressed: () {
                                          _assignRequest(request, specialist);
                                        },
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.blue,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 16,
                                            vertical: 12,
                                          ),
                                        ),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              specialist.displayName,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14,
                                              ),
                                            ),
                                            if (staffCount > 0)
                                              Text(
                                                '($staffCount staff)',
                                                style: const TextStyle(fontSize: 11),
                                              ),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
            const SizedBox(height: 32),
            const Divider(thickness: 2),
            const SizedBox(height: 16),
            const Text(
              'Assigned Requests',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _assignedRequests.isEmpty
                ? const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('No assigned requests yet'),
                    ),
                  )
                : Column(
                    children: _assignedRequests.map((request) {
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ExpansionTile(
                          title: Text(request.description),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Location: ${request.location}'),
                              if (request.assignedSpecialist != null)
                                Text(
                                  'Assigned to: ${request.assignedSpecialist!.displayName} Department',
                                  style: const TextStyle(fontSize: 12),
                                ),
                            ],
                          ),
                          trailing: Text(
                            request.status,
                            style: TextStyle(
                              color: _getStatusColor(request.status),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          children: [
                            if (request.imageBytes.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: request.imageBytes.map((bytes) {
                                    return ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.memory(
                                        bytes,
                                        width: 100,
                                        height: 100,
                                        fit: BoxFit.cover,
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
          ],
        ),
      ),
    );
  }
}
