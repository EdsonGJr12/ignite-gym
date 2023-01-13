import { useState } from "react";
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base";

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { TouchableOpacity } from "react-native";
import { Input } from "@components/Input";
import { Button } from "@components/Button";

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const PHOTO_SIZE = 33;

export function Profile() {

    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const [userPhoto, setUserPhoto] = useState("https://github.com/EdsonGJr12.png");

    const toast = useToast();

    async function handleUserPhotoSelect() {
        try {
            setPhotoIsLoading(true);
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true
            });

            if (result.canceled) {
                return;
            }

            const photoUri = result.assets[0].uri;

            const photoInfo = await FileSystem.getInfoAsync(photoUri);
            if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 3) {
                return toast.show({
                    title: "Essa imagem é muito grande",
                    description: "Escolha uma imagem com tamanho menor",
                    placement: "top",
                    bgColor: "red.500"
                });
            }

            setUserPhoto(photoUri);
        } catch (error) {
            console.log(error);
        } finally {
            setPhotoIsLoading(false);
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: 36
                }}
            >
                <Center mt={6} px={10}>
                    {photoIsLoading ? (
                        <Skeleton
                            w={PHOTO_SIZE}
                            h={PHOTO_SIZE}
                            rounded="full"
                            startColor="gray.500"
                            endColor="gray.400"
                        />

                    ) : (
                        <UserPhoto
                            source={{
                                uri: userPhoto
                            }}
                            alt="Foto so usuário"
                            size={PHOTO_SIZE}
                        />
                    )}

                    <TouchableOpacity onPress={handleUserPhotoSelect}>
                        <Text
                            color="green.500"
                            fontWeight="bold"
                            fontSize="md"
                            mt={2}
                            mb={8}
                        >
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Input
                        placeholder="Nome"
                        bg="gray.600"
                    />

                    <Input
                        placeholder="E-mail"
                        bg="gray.600"
                        isDisabled
                    />
                </Center>

                <VStack px={10} mt={12} mb={9}>
                    <Heading color="gray.200" fontSize="md" mb={2}>
                        Alterar senha
                    </Heading>

                    <Input
                        placeholder="Senha antiga"
                        bg="gray.600"
                        secureTextEntry
                    />

                    <Input
                        placeholder="Nova senha"
                        bg="gray.600"
                        secureTextEntry
                    />

                    <Input
                        placeholder="Confirme a nova senha"
                        bg="gray.600"
                        secureTextEntry
                    />

                    <Button
                        title="Atualizar"
                    />

                </VStack>

            </ScrollView>
        </VStack>
    )
}