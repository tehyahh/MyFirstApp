import React, {
  useState,
} from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useTheme,
} from '../../constants/ThemeContext';

import {
  AnimatedPressable,
  Header,
  Screen,
} from '../../components/journal/JournalUI';

const QUICK_MESSAGES = [
  {
    id: 'grateful',
    text: "I'm feeling grateful today.",
    icon: 'sunny-outline',
  },
  {
    id: 'hard',
    text: "It's been a hard day.",
    icon: 'cloud-outline',
  },
  {
    id: 'proud',
    text: "I'm proud of myself.",
    icon: 'star-outline',
  },
  {
    id: 'overwhelmed',
    text: "I'm feeling a little overwhelmed.",
    icon: 'leaf-outline',
  },
  {
    id: 'good',
    text: 'Today was actually a good day.',
    icon: 'happy-outline',
  },
  {
    id: 'okay',
    text: "I'm just feeling okay.",
    icon: 'flower-outline',
  },
  {
    id: 'excited',
    text: "I'm excited about what's ahead.",
    icon: 'sparkles-outline',
  },
  {
    id: 'sad',
    text: "I'm feeling a bit sad today.",
    icon: 'water-outline',
  },
];

export default function MindPromptScreen() {
  const router = useRouter();

  const { theme } = useTheme();

  const [selected, setSelected] =
    useState('');

  const [customText, setCustomText] =
    useState('');

  const chooseMessage = (
    message: string
  ) => {
    setSelected(message);
    setCustomText('');
  };

  const done = () => {
    const text =
      customText.trim() ||
      selected.trim();

    if (!text) {
      Alert.alert(
        'Write something first',
        'Choose a quick message or write your own thought.'
      );

      return;
    }

    router.push({
      pathname:
        '/journal/AddJournalScreen',
      params: {
        prompt: text,
      },
    });
  };

  return (
    <Screen>
      <Header
        title="What's on your mind?"
        subtitle="Choose a message or write your own."
        onBack={() =>
          router.back()
        }
      />

      <View
        style={[
          styles.iconHeader,
          {
            backgroundColor:
              theme.primarySoft,
          },
        ]}
      >
        <Ionicons
          name="bulb-outline"
          size={28}
          color={theme.primary}
        />
      </View>

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Quick Messages
      </Text>

      <View style={styles.grid}>
        {QUICK_MESSAGES.map(
          message => {
            const active =
              selected ===
              message.text;

            return (
              <AnimatedPressable
                key={message.id}
                onPress={() =>
                  chooseMessage(
                    message.text
                  )
                }
                style={[
                  styles.quickCard,
                  {
                    backgroundColor:
                      active
                        ? theme.primarySoft
                        : theme.surface,
                    borderColor:
                      active
                        ? theme.primary
                        : theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.quickIcon,
                    {
                      backgroundColor:
                        active
                          ? theme.surface
                          : theme.surfaceSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      message.icon as any
                    }
                    size={21}
                    color={
                      theme.primary
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.quickText,
                    {
                      color:
                        theme.text,
                    },
                  ]}
                >
                  {message.text}
                </Text>
              </AnimatedPressable>
            );
          }
        )}
      </View>

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Or write your own
      </Text>

      <TextInput
        value={customText}
        onChangeText={text => {
          setCustomText(text);
          setSelected('');
        }}
        multiline
        maxLength={500}
        placeholder="Share whatever's on your mind..."
        placeholderTextColor={
          theme.muted
        }
        style={[
          styles.textInput,
          {
            backgroundColor:
              theme.surface,
            borderColor:
              theme.border,
            color: theme.text,
          },
        ]}
        textAlignVertical="top"
      />

      <Text
        style={[
          styles.counter,
          { color: theme.muted },
        ]}
      >
        {customText.length}/500
      </Text>

      <View style={styles.buttons}>
        <AnimatedPressable
          onPress={() =>
            router.back()
          }
          style={[
            styles.button,
            {
              backgroundColor:
                theme.surfaceSoft,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.text },
            ]}
          >
            Cancel
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          onPress={done}
          style={[
            styles.button,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
        >
          <Ionicons
            name="paper-plane-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={[
              styles.buttonText,
              { color: '#FFFFFF' },
            ]}
          >
            Done
          </Text>
        </AnimatedPressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconHeader: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },

  quickCard: {
    width: '48%',
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  textInput: {
    minHeight: 125,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    fontSize: 13,
    lineHeight: 20,
  },

  counter: {
    textAlign: 'right',
    fontSize: 9,
    marginTop: 3,
  },

  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  button: {
    flex: 1,
    minHeight: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  buttonText: {
    fontSize: 12,
    fontWeight: '800',
  },
});