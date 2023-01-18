import { createBottomTabNavigator, BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import HomeSvg from "@assets/home.svg";
import HistorySvg from "@assets/history.svg";
import ProfileSvg from "@assets/profile.svg";

import { Home } from "@screens/Home";
import { Profile } from "@screens/Profile";
import { History } from "@screens/History";
import { Exercise } from "@screens/Exercise";
import { useTheme } from "native-base";
import { Platform } from "react-native";

type AppRoutes = {
    home: undefined;
    exercise: undefined;
    profile: undefined;
    history: undefined;
}

export type AppNavigatorRouteProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

export function AppRoutes() {

    const theme = useTheme();
    const iconSize = theme.sizes[6];

    return (
        <Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: theme.colors.green[500],
                tabBarInactiveTintColor: theme.colors.gray[200],
                tabBarStyle: {
                    backgroundColor: theme.colors.gray[600],
                    borderTopWidth: 0,
                    height: Platform.OS === "android" ? "auto" : 96,
                    paddingBottom: theme.sizes[10],
                    paddingTop: theme.sizes[6]
                }
            }}
        >
            <Screen
                name="home"
                component={Home}
                options={{
                    tabBarIcon: ({ color }) => (
                        <HomeSvg
                            fill={color}
                            width={iconSize}
                            height={iconSize}
                        />
                    )
                }}
            />

            <Screen
                name="history"
                component={History}
                options={{
                    tabBarIcon: ({ color }) => (
                        <HistorySvg
                            fill={color}
                            width={iconSize}
                            height={iconSize}
                        />
                    )
                }}
            />

            <Screen
                name="profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ color }) => (
                        <ProfileSvg
                            fill={color}
                            width={iconSize}
                            height={iconSize}
                        />
                    )
                }}
            />

            <Screen
                name="exercise"
                component={Exercise}
                options={{
                    tabBarButton: () => null
                }}

            />
        </Navigator>
    );
}