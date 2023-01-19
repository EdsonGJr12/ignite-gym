import { Heading, SectionList, Text, useToast } from "native-base";
import { VStack } from "native-base";

import { ScreenHeader } from "@components/ScreenHeader";
import { HistoryCard } from "@components/HistoryCard";
import { useCallback, useEffect, useState } from "react";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { useFocusEffect } from "@react-navigation/native";
import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO";

export function History() {

    const [isLoading, setIsLoading] = useState(true);
    const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

    const toast = useToast();

    async function fetchHistory() {
        try {
            const response = await api.get(`/history`);
            setExercises(response.data);
            console.log(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível carregar o histórico";

            toast.show({
                title,
                placement: 'top',
                bgColor: "red.500"
            });

        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchHistory()
        }, [])
    );

    return (
        <VStack flex={1}>
            <ScreenHeader title="Histórico de Exercícios" />

            <SectionList
                sections={exercises}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <HistoryCard data={item} />
                )}
                renderSectionHeader={({ section }) => (
                    <Heading
                        color="gray.200"
                        fontSize="md"
                        mt={10}
                        mb={3}
                        fontFamily="heading"
                    >
                        {section.title}
                    </Heading>
                )}
                ListEmptyComponent={() => (
                    <Text color="gray.100" textAlign="center">
                        Não há exercícios registrados ainda.
                        {"\n"}Vamos treinar hoje?
                    </Text>
                )}
                contentContainerStyle={exercises.length === 0 && { flex: 1, justifyContent: "center" }}
                showsVerticalScrollIndicator={false}
                px={8}
            />

        </VStack>
    )
}