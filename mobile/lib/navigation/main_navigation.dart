import 'package:flutter/cupertino.dart';
import 'package:mobile/pages/account_page.dart';
import 'package:mobile/pages/dashboard_page.dart';
import 'package:mobile/pages/depenses_page.dart';
import 'package:mobile/pages/historics_page.dart';
import 'package:mobile/pages/solde_page.dart';

class MainNavigation extends StatelessWidget {
  const MainNavigation({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoTabScaffold(
      tabBar: CupertinoTabBar(
        activeColor: CupertinoColors.activeBlue,
        // backgroundColor: Color.fromARGB(248, 2, 34, 46),
        iconSize: 26,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.home),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.search),
            label: 'Historics',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.add_circled),
            label: 'Depenses',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.chat_bubble_2),
            label: 'Solde',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.person),
            label: 'Profil',
          ),
        ],
      ),
      tabBuilder: (context, index) {
        switch (index) {
          case 0:
            return CupertinoTabView(
              builder: (context) => const DashboardPage(),
            );
          case 1:
            return CupertinoTabView(
              builder: (context) => const HistoricsPage(),
            );
          case 2:
            return CupertinoTabView(builder: (context) => const DepensesPage());
          case 3:
            return CupertinoTabView(builder: (context) => const SoldePage());
          case 4:
            return CupertinoTabView(builder: (context) => const AccountPage());
          default:
            return CupertinoTabView(
              builder: (context) => const DashboardPage(),
            );
        }
      },
    );
  }
}
