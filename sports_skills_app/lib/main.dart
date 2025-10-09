import 'package:flutter/material.dart';
import 'models/skill.dart';
import 'widgets/skill_card.dart';

class SkillsHomePage extends StatelessWidget {
  const SkillsHomePage({Key? key}) : super(key: key);

  // JSON data
  final List<Map<String, String>> skillsJson = const [
    {"name": "Dribbling", "level": "Basic", "image": "https://picsum.photos/200/300?1"},
    {"name": "Vault", "level": "Intermediate", "image": "https://picsum.photos/200/300?2"},
    {"name": "Agility", "level": "Advanced", "image": "https://picsum.photos/200/300?3"},
    {"name": "Defense", "level": "Basic", "image": "https://picsum.photos/200/300?4"},
    {"name": "Endurance", "level": "Intermediate", "image": "https://picsum.photos/200/300?5"},
    {"name": "Strategy", "level": "Advanced", "image": "https://picsum.photos/200/300?6"},
  ];

  @override
  Widget build(BuildContext context) {
    List<Skill> skills = skillsJson.map((s) => Skill.fromJson(s)).toList();

    final basic = skills.where((s) => s.level == 'Basic').toList();
    final inter = skills.where((s) => s.level == 'Intermediate').toList();
    final adv = skills.where((s) => s.level == 'Advanced').toList();

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('🏆 Sports Skills'),
        centerTitle: true,
        backgroundColor: Colors.indigoAccent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Basic Skills',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SkillList(skills: basic),
            const SizedBox(height: 16),
            const Text('Intermediate Skills',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SkillList(skills: inter),
            const SizedBox(height: 16),
            const Text('Advanced Skills',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            SkillList(skills: adv),
          ],
        ),
      ),
    );
  }
}

class SkillList extends StatelessWidget {
  final List<Skill> skills;
  const SkillList({Key? key, required this.skills}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 180,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: skills.length,
        itemBuilder: (context, index) {
          return SkillCard(skill: skills[index]);
        },
      ),
    );
  }
}

void main() {
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    home: SkillsHomePage(),
  ));
}
