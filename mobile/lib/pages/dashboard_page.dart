import 'package:flutter/cupertino.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

   @override
  Widget build(BuildContext context) {
    return const CupertinoPageScaffold(
      child: Center(child: Text("Dashboard"))
    );
  }
}
