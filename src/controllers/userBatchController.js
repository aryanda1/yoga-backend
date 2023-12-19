import User from "../models/User.js";

async function updateBatch() {
  try {
    // Find users where nextBatch is in the past
    const usersToUpdate = await User.find({ nextBatch: { $ne: null } });

    // Update the currentBatch and clear nextBatch for each user
    await Promise.all(
      usersToUpdate.map(async (user) => {
        await user.updateOne({ currentBatch: user.nextBatch, nextBatch: null });
      })
    );
  } catch (err) {
    console.log(err);
  }
}

export function settimeout() {
  const milisec = miliSecondsUntilNextMonth();
  setTimeout(() => updateBatchAndSetTimeout(), milisec);
}

async function updateBatchAndSetTimeout() {
  updateBatch();
  settimeout();
}

function miliSecondsUntilNextMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const miliSecondsUntilNextMonth = nextMonth - now;
  return miliSecondsUntilNextMonth;
}
