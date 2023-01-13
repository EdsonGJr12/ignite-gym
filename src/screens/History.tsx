import { Heading, SectionList, Text } from "native-base";
import { VStack } from "native-base";

import { ScreenHeader } from "@components/ScreenHeader";
import { HistoryCard } from "@components/HistoryCard";
import { useState } from "react";

export function History() {

    const [exercises, setExercises] = useState([
        {
            title: '20.08.22',
            data: ['Puxada frontal', 'Remada unilateral'],
        },
        {
            title: '26.08.22',
            data: ['Puxada frontal'],
        },

    ]);

    return (
        <VStack flex={1}>
            <ScreenHeader title="Histórico de Exercícios" />

            <SectionList
                sections={exercises}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <HistoryCard />
                )}
                renderSectionHeader={({ section }) => (
                    <Heading
                        color="gray.200"
                        fontSize="md"
                        mt={10}
                        mb={3}
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