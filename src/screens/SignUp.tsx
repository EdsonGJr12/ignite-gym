import { Center, Image, Text, VStack, Heading, ScrollView, useToast } from "native-base";

import LogoSvg from "@assets/logo.svg";
import BackgroundImg from '@assets/background.png';

import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api";
import axios from "axios";
import { Alert } from "react-native";
import { AppError } from "@utils/AppError";
import { useAuth } from "@hooks/useAuth";

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
}

const signUpSchema = yup.object({
    name: yup.string().required("Nome é obrigatório"),
    email: yup.string()
        .required("E-mail é obrigatório")
        .email("E-mail inválido"),
    password: yup.string()
        .required("Senha é obrigatória")
        .min(6, "Senha deve ter pelo menos 6 caracteres"),
    password_confirm: yup.string()
        .required("Confirmação de senha é obrigatória")
        .oneOf([yup.ref("password")], "A confirmação da senha não confere")
});

export function SignUp() {

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormDataProps>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirm: ""
        },
        resolver: yupResolver(signUpSchema)
    });

    const navigation = useNavigation();

    const toast = useToast();

    const { signIn } = useAuth();

    function handleGoBack() {
        navigation.goBack();
    }

    async function handleSignUp({ name, email, password }: FormDataProps) {
        try {
            await api.post("/users", { name, email, password });

            await signIn(email, password);

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : "Não foi possível criar a conta. Tente novamente mais tarde"

            toast.show({
                title,
                placement: "top",
                bgColor: "red.500"
            });
        }
    }

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1
            }}
            showsVerticalScrollIndicator={false}
        >
            <VStack flex={1} px={10}>
                <Image
                    source={BackgroundImg}
                    defaultSource={BackgroundImg}
                    alt="Pessoas treinando"
                    resizeMode="contain"
                    position="absolute"
                />

                <Center my={24}>
                    <LogoSvg />

                    <Text color="gray.100" fontSize="sm">
                        Treine sua mente e seu corpo
                    </Text>
                </Center>

                <Center>
                    <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
                        Crie sua conta
                    </Heading>

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Nome"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="E-mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Senha"
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password_confirm"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder="Confirme a Senha"
                                secureTextEntry
                                onChangeText={onChange}
                                onSubmitEditing={handleSubmit(handleSignUp)}
                                returnKeyType="send"
                                value={value}
                                errorMessage={errors.password_confirm?.message}
                            />
                        )}
                    />

                    <Button
                        title="Criar e acessar"
                        onPress={handleSubmit(handleSignUp)}
                        isLoading={isSubmitting}
                    />
                </Center>

                <Button
                    title="Voltar para o login"
                    variant="outline"
                    mt={24}
                    onPress={handleGoBack}
                />
            </VStack>
        </ScrollView>
    );
}