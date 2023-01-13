import { Pressable, Text, IPressableProps } from "native-base";

type Props = IPressableProps & {
    name: string;
    isActive?: boolean;
}

export function Group({ name, isActive = false, ...rest }: Props) {
    return (
        <Pressable
            mr={6}
            w={24}
            h={10}
            bg="gray.600"
            rounded="md"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            isPressed={isActive}
            _pressed={{
                borderColor: "green.500",
                borderWidth: 1
            }}
            {...rest}
        >
            <Text
                color="gray.200"
                textTransform="uppercase"
                fontSize="xs"
                fontWeight="bold"
                fontFamily="heading"
            >
                {name}
            </Text>
        </Pressable>
    );
}