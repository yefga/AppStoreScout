import React, { memo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageSourcePropType,
    useWindowDimensions,
} from 'react-native';

type EmptyStateProps = {
    title: string;
    description: string;
    /** Local require(...) or remote URL string */
    image?: ImageSourcePropType | string;
};

export default memo(function EmptyState(props: EmptyStateProps) {
    const [showImg, setShowImg] = useState(true);
    const { width: screenWidth } = useWindowDimensions();

    // Normalize the image prop: if it's a string, convert to { uri }
    const source =
        typeof props.image === 'string'
            ? { uri: props.image }
            : (props.image as ImageSourcePropType | undefined);

    const imgWidth = screenWidth - 48; // screen width minus 48
    const imgHeight = imgWidth; // make it square

    return (
        <View style={styles.wrap}>
            {source && showImg ? (
                <Image
                    source={source}
                    style={[{ width: imgWidth, height: imgHeight }]}
                    resizeMode="contain"
                    accessible
                    accessibilityLabel="Empty state illustration"
                    onError={() => setShowImg(false)} // hide if remote URL fails
                />
            ) : null}

            <Text style={styles.title}>{props.title}</Text>
            <Text style={styles.desc}>{props.description}</Text>
        </View>
    );
});

/* ------------------------------- styles ---------------------------------- */
const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1B1C1F',
        textAlign: 'center',
        marginBottom: 6,
    },
    desc: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});