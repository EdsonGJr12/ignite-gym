import { useState } from "react";
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base";

import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { TouchableOpacity } from "react-native";
import { Input } from "@components/Input";
import { Button } from "@components/Button";

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

import defaultUserPhoto from "@assets/userPhotoDefault.png";

const PHOTO_SIZE = 33;

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    old_password: string;
    confirm_password: string;
}

const profileSchema = yup.object({
    name: yup.string().required("Informe o nome"),
    password: yup.string()
        .min(6, "A senha deve ter pelo menos 6 dígitos")
        .nullable()
        .transform(value => !!value ? value : null),
    confirm_password: yup.string()
        .oneOf([yup.ref("password")], "A confirmação de senha não confere")
        .when("password", {
            is: (field: any) => field,
            then: yup.string()
                .nullable()
                .transform(value => !!value ? value : null)
                .required("Informa a confirmação da senha")
        })
        .nullable()
        .transform(value => !!value ? value : null),
});

export function Profile() {

    const [photoIsLoading, setPhotoIsLoading] = useState(false);

    const toast = useToast();
    const { user, updateUserProfle } = useAuth();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email
        },
        resolver: yupResolver(profileSchema)
    });

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
            const photoType = result.assets[0].type;

            const photoInfo = await FileSystem.getInfoAsync(photoUri);
            if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 3) {
                return toast.show({
                    title: "Essa imagem é muito grande",
                    description: "Escolha uma imagem com tamanho menor",
                    placement: "top",
                    bgColor: "red.500"
                });
            }

            const fileExtension = photoUri.split(".").pop();

            const photoFile = {
                name: `${user.name}.${fileExtension}}`.toLowerCase(),
                uri: photoUri,
                type: `${photoType}/${fileExtension}`
            } as any;

            const userPhotoUploadForm = new FormData();
            userPhotoUploadForm.append("avatar", photoFile);

            const response = await api.patch("/users/avatar", userPhotoUploadForm, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            updateUserProfle({
                ...user,
                avatar: response.data.avatar
            });

            toast.show({
                title: "Foto atualizada",
                placement: "top",
                bgColor: "green.500"
            });

        } catch (error) {
            console.log(error);
        } finally {
            setPhotoIsLoading(false);
        }
    }

    async function handleProfileUpdate({ name, password, old_password }: FormDataProps) {
        try {
            await api.put("/users", { name, password, old_password });

            toast.show({
                title: "Perfil atualizado com sucesso",
                placement: "top",
                bgColor: "green.500"
            });

            await updateUserProfle({
                ...user,
                name
            });

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível atualizar os dados. Tente novamente mais tarde";

            toast.show({
                title,
                placement: "top",
                bgColor: "red.500"
            });
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
                            source={
                                user.avatar ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } : defaultUserPhoto
                            }
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

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                placeholder="Nome"
                                bg="gray.600"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { value, onChange } }) => (
                            <Input
                                placeholder="E-mail"
                                bg="gray.600"
                                isDisabled
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                </Center>

                <VStack px={10} mt={12} mb={9}>
                    <Heading color="gray.200" fontSize="md" mb={2} fontFamily="heading">
                        Alterar senha
                    </Heading>

                    <Controller
                        control={control}
                        name="old_password"
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder="Senha antiga"
                                bg="gray.600"
                                secureTextEntry
                                onChangeText={onChange}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder="Nova senha"
                                bg="gray.600"
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirm_password"
                        render={({ field: { onChange } }) => (
                            <Input
                                placeholder="Confirme a nova senha"
                                bg="gray.600"
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.confirm_password?.message}
                            />
                        )}
                    />

                    <Button
                        title="Atualizar"
                        onPress={handleSubmit(handleProfileUpdate)}
                        isLoading={isSubmitting}
                    />

                </VStack>

            </ScrollView>
        </VStack>
    )
}