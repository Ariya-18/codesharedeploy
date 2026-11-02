const Analytics = require("../models/Analytics");
const SessionRecord = require("../models/SessionRecord");

class AnalyticsService {
  /**
   * Generate analytics for a session recording
   */
  async generateAnalytics(recordingId, userId) {
    try {
      const recording = await SessionRecord.findById(recordingId);
      if (!recording) throw new Error("Recording not found");

      const events = recording.events || [];
      
      // Calculate metrics
      const metrics = {
        totalSessionTime: recording.duration || 0,
        activeTime: this.calculateActiveTime(events),
        idleTime: (recording.duration || 0) - this.calculateActiveTime(events),
        totalLinesAdded: this.countLinesAdded(events),
        totalLinesDeleted: this.countLinesDeleted(events),
        totalCharactersAdded: this.countCharsAdded(events),
        totalCharactersDeleted: this.countCharsDeleted(events),
        averageTypingSpeed: this.calculateTypingSpeed(events, recording.duration || 0),
        totalExecutions: events.filter((e) => e.type === "execution").length,
        successfulExecutions: events.filter(
          (e) => e.type === "execution" && e.output?.status === "Accepted"
        ).length,
        failedExecutions: events.filter(
          (e) => e.type === "execution" && e.output?.status !== "Accepted"
        ).length,
        compilationErrors: events.filter(
          (e) => e.type === "execution" && e.output?.compileOutput
        ).length,
        runtimeErrors: events.filter(
          (e) => e.type === "execution" && e.output?.stderr
        ).length,
        messagesCount: events.filter((e) => e.type === "message").length,
        languagesUsed: this.getLanguagesUsed(events),
      };

      // Calculate additional metrics
      metrics.averageExecutionTime =
        this.calculateAverageExecutionTime(events);
      metrics.averageMessageLength =
        this.calculateAverageMessageLength(events);
      metrics.peakTypingSpeed = this.calculatePeakTypingSpeed(events);
      metrics.contributionPercentage = 100; // Default for single user

      const analytics = await Analytics.create({
        roomId: recording.roomId,
        sessionRecord: recordingId,
        user: userId,
        ...metrics,
      });

      return analytics;
    } catch (error) {
      console.error("Failed to generate analytics:", error);
      throw error;
    }
  }

  calculateActiveTime(events) {
    let activeTime = 0;
    const IDLE_THRESHOLD = 30000; // 30 seconds

    let lastEventTime = 0;
    for (const event of events) {
      if (event.type === "code-change") {
        const timeSinceLastEvent = event.timestamp - lastEventTime;
        if (timeSinceLastEvent > IDLE_THRESHOLD) {
          // Count as idle
          activeTime += IDLE_THRESHOLD;
        } else {
          activeTime += timeSinceLastEvent;
        }
        lastEventTime = event.timestamp;
      }
    }
    return activeTime;
  }

  countLinesAdded(events) {
    let totalLines = 0;
    for (const event of events) {
      if (event.type === "code-change" && event.code) {
        totalLines += (event.code.match(/\n/g) || []).length + 1;
      }
    }
    return totalLines;
  }

  countLinesDeleted(events) {
    // Estimate based on total additions vs final code
    return Math.max(0, this.countLinesAdded(events) / 2);
  }

  countCharsAdded(events) {
    let totalChars = 0;
    for (const event of events) {
      if (event.type === "code-change" && event.code) {
        totalChars += event.code.length;
      }
    }
    return totalChars;
  }

  countCharsDeleted(events) {
    return Math.max(0, this.countCharsAdded(events) / 2);
  }

  calculateTypingSpeed(events, duration) {
    if (duration === 0) return 0;
    const totalChars = this.countCharsAdded(events);
    const durationMinutes = duration / 60000;
    return durationMinutes > 0 ? Math.round(totalChars / durationMinutes) : 0;
  }

  calculatePeakTypingSpeed(events) {
    let maxSpeed = 0;
    let windowStart = 0;
    const WINDOW_SIZE = 60000; // 1 minute window

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.type === "code-change") {
        // Count changes in 1-minute window
        let charsInWindow = 0;
        for (let j = 0; j < events.length; j++) {
          if (
            events[j].type === "code-change" &&
            events[j].timestamp >= event.timestamp &&
            events[j].timestamp < event.timestamp + WINDOW_SIZE
          ) {
            charsInWindow += events[j].code?.length || 0;
          }
        }
        maxSpeed = Math.max(maxSpeed, charsInWindow);
      }
    }
    return maxSpeed;
  }

  calculateAverageExecutionTime(events) {
    const executions = events.filter((e) => e.type === "execution");
    if (executions.length === 0) return 0;

    const totalTime = executions.reduce((sum, e) => sum + (e.output?.time || 0), 0);
    return parseFloat((totalTime / executions.length).toFixed(2));
  }

  calculateAverageMessageLength(events) {
    const messages = events.filter((e) => e.type === "message");
    if (messages.length === 0) return 0;

    const totalLength = messages.reduce((sum, m) => sum + (m.text?.length || 0), 0);
    return Math.round(totalLength / messages.length);
  }

  getLanguagesUsed(events) {
    const languages = {};
    for (const event of events) {
      if (event.language) {
        if (!languages[event.language]) {
          languages[event.language] = { count: 0, timeSpent: 0 };
        }
        languages[event.language].count++;
      }
    }

    return Object.entries(languages).map(([lang, data]) => ({
      language: lang,
      count: data.count,
      timeSpent: 0, // Would need more tracking for accuracy
    }));
  }

  /**
   * Get analytics for a room
   */
  async getRoomAnalytics(roomId) {
    try {
      const analytics = await Analytics.find({ roomId: roomId.toUpperCase() })
        .populate("user", "name email profilePicture")
        .sort({ createdAt: -1 });

      return analytics;
    } catch (error) {
      console.error("Failed to get room analytics:", error);
      throw error;
    }
  }

  /**
   * Get user's analytics
   */
  async getUserAnalytics(userId, limit = 10) {
    try {
      const analytics = await Analytics.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("sessionRecord");

      return analytics;
    } catch (error) {
      console.error("Failed to get user analytics:", error);
      throw error;
    }
  }

  /**
   * Get analytics by session
   */
  async getSessionAnalytics(sessionRecordId) {
    try {
      const analytics = await Analytics.findOne({ sessionRecord: sessionRecordId })
        .populate("user", "name email profilePicture");

      return analytics;
    } catch (error) {
      console.error("Failed to get session analytics:", error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
