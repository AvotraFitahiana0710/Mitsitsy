import 'package:flutter/cupertino.dart';

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('Profil'),
        // leading: Icon(
        //   CupertinoIcons.person_circle,
        //   size: 28,
        //   color: Color.fromARGB(255, 0, 7, 15),
        // ),
        trailing: Icon(
          CupertinoIcons.ellipsis_vertical,
          size: 28,
          color: Color.fromARGB(255, 0, 7, 15),
        ),
      ),
      child: Center(child: Text('Profil')),
    );
  }
}
