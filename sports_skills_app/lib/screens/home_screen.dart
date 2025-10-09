import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/skill.dart';
import '../widgets/skill_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Skill> _skills = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSkills();
  }

  Future<void> _loadSkills() async {
    try {
      final raw = await rootBundle.loadString('assets/skills.json');
      final data = json.decode(raw) as List<dynamic>;
      setState(() {
        _skills = data.map((e) => Skill.fromJson(e as Map<String, dynamic>)).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _skills = [];
        _loading = false;
      });
    }
  }

  List<Skill> _filter(String level) => _skills.where((s) => s.level == level).toList();

  Widget _buildSection(String title, List<Skill> items) {
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
          child: Text(title,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.indigo)),
        ),
        SizedBox(
          height: 170,
          child: ListView.builder(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            itemBuilder: (context, index) {
              return SkillCard(skill: items[index]);
            },
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final basic = _filter('Basic');
    final intermediate = _filter('Intermediate');
    final advanced = _filter('Advanced');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sports Skills'),
        centerTitle: true,
        elevation: 2,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildSection('Basic', basic),
            _buildSection('Intermediate', intermediate),
            _buildSection('Advanced', advanced),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
