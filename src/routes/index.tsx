import { Box, useTheme } from "native-base";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { AuthRoutes } from "./auth.routes";
import { AppRoutes } from "./app.routes";
import { useAuth } from "@hooks/useAuth";
import { Loading } from "@components/Loading";

export function Routes() {
    const nativeBaseTheme = useTheme();
    const navigationTheme = DefaultTheme;
    navigationTheme.colors.background = nativeBaseTheme.colors.gray[700];

    const { user, isLoadingUserStorageData } = useAuth();

    if (isLoadingUserStorageData) {
        return <Loading />
    }

    return (
        <Box flex={1} bg="gray.700">
            <NavigationContainer theme={navigationTheme}>
                {user.id ? <AppRoutes /> : <AuthRoutes />}
            </NavigationContainer>
        </Box>
    );
}