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