import 'package:flutter/material.dart';

void main() => runApp(const MaintenanceApp());

class MaintenanceApp extends StatelessWidget {
  const MaintenanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Maintenance Request and Complaint Management System',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const HomePage(),
    );
  }
}

// -------------------- 🏠 HOME PAGE --------------------
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Maintenance Request and Complaint Management System',
        ),
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Welcome to Maintenance Request and Complaint Management System',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              ElevatedButton.icon(
                icon: const Icon(Icons.person),
                label: const Text('User'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const UserPage()),
                  );
                },
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                icon: const Icon(Icons.build),
                label: const Text('Staff'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const StaffPage()),
                  );
                },
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

  static List<Map<String, String>> requests = [];

  void _submitRequest() {
    final desc = _descriptionController.text.trim();
    final loc = _locationController.text.trim();

    if (desc.isEmpty || loc.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }

    setState(() {
      requests.add({'description': desc, 'location': loc, 'status': 'Pending'});
    });

    _descriptionController.clear();
    _locationController.clear();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Request submitted successfully!')),
    );
  }

  void _goToHistoryPage() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProgressHistoryPage(requests: requests),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Page')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section 1: Submit Request
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
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Location',
                border: OutlineInputBorder(),
              ),
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

            // Section 2: View History
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
  final List<Map<String, String>> requests;

  const ProgressHistoryPage({super.key, required this.requests});

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
      body: requests.isEmpty
          ? const Center(child: Text('No requests submitted yet.'))
          : ListView.builder(
              itemCount: requests.length,
              itemBuilder: (context, index) {
                final request = requests[index];
                final status = request['status'] ?? 'Pending';
                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: ListTile(
                    title: Text(request['description'] ?? ''),
                    subtitle: Text('Location: ${request['location'] ?? ''}'),
                    trailing: Text(
                      status,
                      style: TextStyle(
                        color: _getStatusColor(status),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}

// -------------------- 🛠️ STAFF PAGE --------------------
class StaffPage extends StatefulWidget {
  const StaffPage({super.key});

  @override
  State<StaffPage> createState() => _StaffPageState();
}

class _StaffPageState extends State<StaffPage> {
  List<Map<String, String>> requests = List.from(_UserPageState.requests);

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Staff Page')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: ['Pending', 'In Progress', 'Done'].map((status) {
            final filtered = requests
                .where((r) => r['status'] == status)
                .toList();
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
                        child: ListTile(
                          title: Text(req['description'] ?? ''),
                          subtitle: Text('Location: ${req['location']}'),
                          trailing: DropdownButton<String>(
                            value: req['status'],
                            onChanged: (value) {
                              setState(() {
                                req['status'] = value!;
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
