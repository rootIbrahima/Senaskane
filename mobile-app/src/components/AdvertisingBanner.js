import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SPACING } from '../utils/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - SPACING.md * 2;
const BANNER_HEIGHT = 180;

// Images de démonstration - vous pouvez les remplacer par vos propres images
const DEMO_ADS = [
  {
    id: '1',
    image: require('../../assets/icon.png'),
    backgroundColor: '#E3F2FD',
  },
  {
    id: '2',
    image: require('../../assets/icon.png'),
    backgroundColor: '#F3E5F5',
  },
  {
    id: '3',
    image: require('../../assets/icon.png'),
    backgroundColor: '#E8F5E9',
  },
  {
    id: '4',
    image: require('../../assets/icon.png'),
    backgroundColor: '#FFF3E0',
  },
];

export const AdvertisingBanner = ({ ads = DEMO_ADS, autoScroll = true, autoScrollInterval = 4000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!autoScroll || ads.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % ads.length;
      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * BANNER_WIDTH,
        animated: true,
      });
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoScroll, ads.length, autoScrollInterval]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / BANNER_WIDTH);
    setCurrentIndex(index);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bannerItem}
      activeOpacity={0.9}
      onPress={() => console.log('Banner pressed:', item.id)}
    >
      <View style={[styles.bannerContent, { backgroundColor: item.backgroundColor }]}>
        <Image
          source={item.image}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {ads.map((_, index) => {
        const inputRange = [
          (index - 1) * BANNER_WIDTH,
          index * BANNER_WIDTH,
          (index + 1) * BANNER_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 20, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: currentIndex === index ? COLORS.primary : COLORS.textSecondary,
              },
            ]}
          />
        );
      })}
    </View>
  );

  if (!ads || ads.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
      />
      {ads.length > 1 && renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  flatListContent: {
    paddingHorizontal: 0,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  bannerContent: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
