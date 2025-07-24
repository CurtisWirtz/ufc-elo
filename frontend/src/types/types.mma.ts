export interface Event {
    event_id: string;
    name: string;
    date: string;
    location: string;
    bout_order: string[];
}
    // event_id = models.CharField(max_length=64, primary_key=True)
    // name = models.CharField(max_length=255)
    // date = models.DateField()
    // location = models.CharField(max_length=255)
    // bout_order = ArrayField(models.CharField(max_length=64), blank=True, default=list)


export interface Fighter {
    fighter_id: string;
    name: string;
    nickname?: string;
    wins: number;
    losses: number;
    draws: string;
    height_in?: number;
    weight_lb?: number;
    reach_in?: number;
    stance?: string;
    date_of_birth?: string;
}
    // name = models.CharField(max_length=255)
    // nickname = models.CharField(max_length=255, null=True, blank=True)
    // wins = models.IntegerField(default=0)
    // losses = models.IntegerField(default=0)
    // draws = models.CharField(max_length=64, default="0")
    // height_in = models.IntegerField(null=True, blank=True)
    // weight_lb = models.IntegerField(null=True, blank=True)
    // reach_in = models.IntegerField(null=True, blank=True)
    // stance = models.CharField(max_length=64, null=True, blank=True)
    // date_of_birth = models.DateField(null=True, blank=True)


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