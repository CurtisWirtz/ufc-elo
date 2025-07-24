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