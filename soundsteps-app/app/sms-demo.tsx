import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { colors } from '../styles/theme';

interface SMSMessage {
    id: string;
    text: string;
    sender: 'student' | 'system';
    timestamp: Date;
}

interface DemoStats {
    totalStudents: number;
    activeLessons: number;
    completionRate: number;
    smsReach: string;
}

export default function SMSDemoScreen() {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? colors.dark : colors.light;
    const [messages, setMessages] = useState<SMSMessage[]>([]);
    const [demoStats, setDemoStats] = useState<DemoStats>({
        totalStudents: 0,
        activeLessons: 0,
        completionRate: 0,
        smsReach: '99% across Africa'
    });
    const [currentStep, setCurrentStep] = useState(0);

    const demoFlow = [
        {
            title: "SMS Lesson Starts",
            message: "📚 Math Lesson: Adding Fractions\n\nFractions are parts of a whole. When we add fractions, we combine these parts.\n\nStarting quiz now...",
            sender: 'system' as const
        },
        {
            title: "Question 1",
            message: "❓ Question 1/3\n\n1/2 + 1/4 = ?\n\nA) 1/6\nB) 2/6\nC) 3/4\nD) 6/8\n\nReply A, B, C or D",
            sender: 'system' as const
        },
        {
            title: "Student Answer",
            message: "C",
            sender: 'student' as const
        },
        {
            title: "Feedback",
            message: "✅ Correct! 1/2 + 1/4 = 3/4",
            sender: 'system' as const
        },
        {
            title: "Question 2",
            message: "❓ Question 2/3\n\n2/3 + 1/6 = ?\n\nA) 3/6\nB) 4/9\nC) 5/6\nD) 1/2\n\nReply A, B, C or D",
            sender: 'system' as const
        },
        {
            title: "Student Answer",
            message: "C",
            sender: 'student' as const
        },
        {
            title: "Feedback",
            message: "✅ Perfect! 2/3 + 1/6 = 5/6",
            sender: 'system' as const
        },
        {
            title: "Final Question",
            message: "❓ Question 3/3\n\n3/5 + 1/10 = ?\n\nA) 4/15\nB) 7/10\nC) 4/10\nD) 6/15\n\nReply A, B, C or D",
            sender: 'system' as const
        },
        {
            title: "Student Answer",
            message: "B",
            sender: 'student' as const
        },
        {
            title: "Final Results",
            message: "🎉 Lesson Complete!\n\n📚 Adding Fractions\n📊 Final Score: 3/3 (100%)\n\n🌟 Excellent work! You passed!\n\nThank you for using SoundSteps! 📱",
            sender: 'system' as const
        },
        {
            title: "Parent SMS",
            message: "📚 SoundSteps Update\n\nStudent: Grace\nLesson: Adding Fractions\nQuiz Score: 3/3 (100%)\n\n🎉 Great job! Your student passed!\n\nFor more details, check the SoundSteps app.",
            sender: 'system' as const
        }
    ];

    const startDemo = () => {
        setMessages([]);
        setCurrentStep(0);
        setDemoStats({
            totalStudents: 0,
            activeLessons: 0,
            completionRate: 0,
            smsReach: '99% across Africa'
        });
        runDemoStep(0);
    };

    const runDemoStep = (step: number) => {
        if (step >= demoFlow.length) return;

        const demoStep = demoFlow[step];
        const newMessage: SMSMessage = {
            id: `demo-${step}`,
            text: demoStep.message,
            sender: demoStep.sender,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);

        // Update stats progressively
        setDemoStats(prev => ({
            ...prev,
            totalStudents: Math.min(step * 150 + 1200, 2500),
            activeLessons: Math.min(step * 25 + 100, 450),
            completionRate: Math.min(step * 8 + 65, 94)
        }));

        setCurrentStep(step + 1);
    };

    const nextStep = () => {
        if (currentStep < demoFlow.length) {
            runDemoStep(currentStep);
        } else {
            Alert.alert('Demo Complete', 'SMS Demo finished! Ready to present to judges.');
        }
    };

    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>SMS Learning Demo</Text>
                <Text style={styles.headerSubtitle}>Reaching Every Student in Africa</Text>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Live Platform Stats</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statLabel}>Total Students Reached:</Text>
                    <Text style={styles.statValue}>{demoStats.totalStudents.toLocaleString()}</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statLabel}>Active Lessons:</Text>
                    <Text style={styles.statValue}>{demoStats.activeLessons}</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statLabel}>Completion Rate:</Text>
                    <Text style={styles.statValue}>{demoStats.completionRate}%</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statLabel}>SMS Accessibility:</Text>
                    <Text style={styles.statValue}>{demoStats.smsReach}</Text>
                </View>
            </View>

            <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
                {messages.map((message, index) => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageContainer,
                            message.sender === 'system' ? {} : { alignSelf: 'flex-end' }
                        ]}
                    >
                        <View
                            style={[
                                message.sender === 'system' ? styles.systemMessage : styles.studentMessage
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    message.sender === 'system'
                                        ? styles.systemMessageText
                                        : styles.studentMessageText
                                ]}
                            >
                                {message.text}
                            </Text>
                        </View>
                        <Text style={styles.timestamp}>
                            {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.controlsContainer}>
                <View style={styles.demoInfo}>
                    <Text style={styles.demoInfoText}>
                        📱 Demo simulates real SMS conversation between student and SoundSteps platform
                    </Text>
                </View>

                <TouchableOpacity style={styles.demoButton} onPress={startDemo}>
                    <Text style={styles.demoButtonText}>🚀 Start Full Demo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        currentStep >= demoFlow.length && styles.nextButtonDisabled
                    ]}
                    onPress={nextStep}
                    disabled={currentStep >= demoFlow.length}
                >
                    <Text style={styles.nextButtonText}>
                        {currentStep < demoFlow.length
                            ? `Next: ${demoFlow[currentStep]?.title || 'Complete'}`
                            : 'Demo Complete'
                        }
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        backgroundColor: theme.primary,
        padding: 20,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginTop: 5,
    },
    statsContainer: {
        backgroundColor: 'white',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    statLabel: {
        fontSize: 14,
        color: theme.textSecondary,
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.primary,
    },
    messagesContainer: {
        flex: 1,
        padding: 15,
    },
    messageContainer: {
        marginVertical: 5,
        maxWidth: '80%',
    },
    systemMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        borderBottomLeftRadius: 5,
        padding: 12,
    },
    studentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: theme.primary,
        borderRadius: 15,
        borderBottomRightRadius: 5,
        padding: 12,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 18,
    },
    systemMessageText: {
        color: '#333',
    },
    studentMessageText: {
        color: 'white',
    },
    timestamp: {
        fontSize: 11,
        color: theme.textSecondary,
        marginTop: 5,
    },
    controlsContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    demoButton: {
        backgroundColor: theme.primary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    demoButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nextButton: {
        backgroundColor: theme.secondary,
        padding: 12,
        borderRadius: 8,
    },
    nextButtonDisabled: {
        backgroundColor: '#ccc',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    demoInfo: {
        backgroundColor: '#e8f4fd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    demoInfoText: {
        fontSize: 12,
        color: '#2196F3',
        textAlign: 'center',
    },
});