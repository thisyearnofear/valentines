import { RaidClicks, DailyStreak } from "../generated/ClickLubRaid/ClickLubRaid";
import { Raid, DailyStreak as StreakEntity } from "../generated/schema";

export function handleRaidClicks(event: RaidClicks): void {
  let id = event.params.channelId.toString();
  let raid = Raid.load(id);
  if (!raid) {
    raid = new Raid(id);
    raid.total = event.params.amount;
    raid.timestamp = event.block.timestamp;
  } else {
    raid.total = raid.total.plus(event.params.amount);
    raid.timestamp = event.block.timestamp;
  }
  raid.save();
}

export function handleDailyStreak(event: DailyStreak): void {
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let streak = new StreakEntity(id);
  streak.user = event.params.user;
  streak.streak = event.params.streak;
  streak.timestamp = event.block.timestamp;
  streak.save();
}