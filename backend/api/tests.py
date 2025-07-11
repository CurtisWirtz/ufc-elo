from django.test import TestCase

# # Custom validation to ensure fighter_1_id and fighter_2_id refer to existing fighters.
# # This is an alternative to having direct ForeignKey fields here, which can be complex
# # when you only have IDs from JSON and aren't mapping them to Django PKs directly on load.
# def clean(self):
#     super().clean()
#     if not Fighter.objects.filter(fighter_id=self.fighter_1_id).exists():
#         raise ValidationError(
#             _('%(value)s is not a valid fighter_1_id.'),
#             params={'value': self.fighter_1_id},
#             code='invalid_fighter_id'
#         )
#     if not Fighter.objects.filter(fighter_id=self.fighter_2_id).exists():
#         raise ValidationError(
#             _('%(value)s is not a valid fighter_2_id.'),
#             params={'value': self.fighter_2_id},
#             code='invalid_fighter_id'
#         )

#     # Ensure winning_fighter_id is one of the participants
#     if self.winning_fighter_id and \
#         str(self.winning_fighter_id) not in [self.fighter_1_id, self.fighter_2_id]:
#         raise ValidationError(
#             _('Winning fighter %(value)s must be one of the participating fighters.'),
#             params={'value': self.winning_fighter_id},
#             code='invalid_winner'
#         )