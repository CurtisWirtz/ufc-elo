import type { Event } from './event.types.ts';
import type { Fighter } from './fighter.types.ts';

export interface Bout {
    bout_id: string;
    event: Event;
    fighter_1: Fighter;
    fighter_2: Fighter;
    winning_fighter?: Fighter;
    result?: string;
    method?: string;
    ending_round?: string;
    ending_time?: string;
    time_format?: string;
    referee?: string;
    details?: string;
}
    // bout_id = models.CharField(max_length=64, primary_key=True)

    // # Storing as FKs directly
    // event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='event_bouts')
    // fighter_1 = models.ForeignKey(Fighter, on_delete=models.CASCADE, related_name='fighter_1_bouts')
    // fighter_2 = models.ForeignKey(Fighter, on_delete=models.CASCADE, related_name='fighter_2_bouts')
    // winning_fighter = models.ForeignKey(Fighter, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_bouts')

    // result = models.CharField(max_length=64, null=True, blank=True)
    // method = models.CharField(max_length=64, null=True, blank=True)
    // ending_round = models.CharField(max_length=64, null=True, blank=True)
    // ending_time = models.CharField(max_length=64, null=True, blank=True)
    // time_format = models.CharField(max_length=64, null=True, blank=True)
    // referee = models.CharField(max_length=255, null=True, blank=True)
    // details = models.CharField(max_length=255, null=True, blank=True)