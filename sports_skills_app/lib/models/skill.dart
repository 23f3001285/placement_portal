class Skill {
  final String name;
  final String level;
  final String image;

  Skill({
    required this.name,
    required this.level,
    required this.image,
  });

  factory Skill.fromJson(Map<String, dynamic> json) {
    return Skill(
      name: json['name'] ?? '',
      level: json['level'] ?? '',
      image: json['image'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'level': level,
        'image': image,
      };
}
