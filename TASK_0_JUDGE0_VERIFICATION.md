# Task 0: Verify Judge0 End-to-End

## Status: IN PROGRESS

### Verification Checklist

#### Backend Setup ✅
- [x] Server running on port 5000
- [x] MongoDB connected at 127.0.0.1:27017
- [x] Judge0 API configured with RapidAPI credentials
- [x] Socket.io initialized with authentication

#### Frontend Setup ✅
- [x] Vite dev server running on port 5173
- [x] API endpoint configured: http://localhost:5000/api
- [x] Socket URL configured: http://localhost:5000

#### Judge0 Service ✅
- [x] judge0Service.js has LANGUAGE_IDS mapping for 24 languages
- [x] executeCode function accepts (code, language, input)
- [x] Returns { stdout, stderr, compileOutput, status, time, memory }
- [x] Error handling for unsupported languages

#### Socket Events ✅
- [x] "run-code" handler in roomSocket.js
- [x] Saves Execution to MongoDB
- [x] Emits "code-result" to room
- [x] Emits "new-execution" to room with user info
- [x] Broadcasts to all participants (io.to(roomId))

#### Frontend Components ✅
- [x] Room.jsx handles "run-code" emission
- [x] Room.jsx handles "code-result" reception and updates output state
- [x] Room.jsx handles "new-execution" reception and updates executions list
- [x] OutputPanel displays execution results in Console tab
- [x] OutputPanel displays execution history in History tab

### Manual Test Steps (Do these in browser)

1. **Open 2 browser windows side-by-side:**
   - Window 1: http://localhost:5173/
   - Window 2: http://localhost:5173/

2. **Sign up and login in both windows** (different users or same user logged in twice)

3. **In Window 1:**
   - Create a new practice room
   - Copy the room ID

4. **In Window 2:**
   - Join the room using the room ID

5. **In both windows:**
   - Verify both users appear in Participants tab
   - Both should see each other's code changes in real-time

6. **In Window 1:**
   - Write simple code: `console.log("Hello from Window 1");`
   - Click **Run**
   - Verify output appears in Console tab

7. **In Window 2:**
   - Verify the same code appears in the editor (real-time sync)
   - Verify the same output appears in Console tab
   - Go to History tab - should see the execution from Window 1

8. **In Window 2:**
   - Change code: `console.log("Response from Window 2");`
   - Click **Run**
   - Verify output appears in Console tab

9. **In both windows:**
   - Go to History tab
   - Verify both executions are listed with user names, timestamps, and status
   - Click to expand and verify code/output are preserved
   - Click "Restore & Edit" and verify code changes in editor

10. **Test with different languages:**
    - In editor, select Python from language dropdown
    - Write: `print("Hello Python")`
    - Click **Run**
    - Verify output is correct

    - Try JavaScript with error:
    ```javascript
    console.log("Hello);
    ```
    - Click **Run**
    - Verify error message appears in Console (compile error)

### Expected Results

✅ All participants see real-time code sync
✅ Run button executes code and returns output
✅ Both stdout and stderr appear correctly
✅ Execution history is saved and retrievable
✅ Multiple language support works
✅ Compile errors are caught and displayed
✅ Performance: Results appear within 2-3 seconds

### Known Issues to Check

- [ ] Duplicate SessionRecord index warning (non-critical, won't affect testing)
- [ ] Check if RapidAPI Judge0 key is valid in .env

### Next Steps After Verification

If all tests pass:
1. Mark Task 0 as COMPLETE
2. Proceed to Task 1: Simplify Auth

If tests fail:
1. Check browser console for errors
2. Check backend console for errors
3. Verify .env has valid Judge0_API_KEY
4. Check MongoDB is running

---

**Test Conducted By:** Kiro
**Date:** 2026-10-30
**Status:** Ready for manual testing
