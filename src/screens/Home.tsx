import { useCallback, useEffect, useState } from "react";

import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { HStack, VStack, FlatList, Heading, Text, useToast } from "native-base";
import { ExerciseCard } from "@components/ExerciseCard";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigatorRouteProps } from "@routes/app.routes";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

export function Home() {

    const [groups, setGroups] = useState<string[]>([]);
    const [groupSelected, setGroupSelected] = useState('antebraço');
    const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigation = useNavigation<AppNavigatorRouteProps>();

    const toast = useToast();

    function handleOpenExerciseDetails(exerciseId: string) {
        navigation.navigate("exercise", { exerciseId });
    }

    async function fetchGroups() {
        try {
            setIsLoading(true);
            const response = await api.get("/groups");
            setGroups(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível carregar os grupos musculares";

            toast.show({
                title,
                placement: 'top',
                bgColor: "red.500"
            })
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchExercisesByGroup() {
        try {
            setIsLoading(true);
            const response = await api.get(`/exercises/bygroup/${groupSelected}`);
            setExercises(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível carregar os exercícios desse grupo";

            toast.show({
                title,
                placement: 'top',
                bgColor: "red.500"
            })
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchExercisesByGroup()
        }, [groupSelected])
    );

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <VStack flex={1}>
            <HomeHeader />

            <FlatList
                data={groups}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <Group
                        name={item}
                        isActive={groupSelected.toUpperCase() === item.toUpperCase()}
                        onPress={() => setGroupSelected(item)}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                _contentContainerStyle={{
                    px: 8,
                }}
                my={8}
                minH={10}
                maxH={10}

            />

            {isLoading ? (
                <Loading />
            ) : (
                <VStack flex={1} px={8}>
                    <HStack justifyContent="space-between" mb={5}>
                        <Heading color="gray.200" fontSize="md" fontFamily="heading">
                            Exercícios
                        </Heading>

                        <Text color="gray.200" fontSize="sm">
                            {exercises.length}
                        </Text>
                    </HStack>

                    <FlatList
                        data={exercises}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <ExerciseCard
                                onPress={() => handleOpenExerciseDetails(item.id)}
                                data={item}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        _contentContainerStyle={{
                            paddingBottom: 20
                        }}
                    />
                </VStack>
            )}


        </VStack>
    )
}