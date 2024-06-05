export const handleAddGroup = (group, setGroup, defaultGroup) => {
  const lastGroup = group[group.length - 1];
  const newId = lastGroup.id + 1;

  const newGroups = [...group, { ...defaultGroup[0], id: newId }];
  setGroup(newGroups);
};

export const handleRemoveGroup = (
  removedGroup,
  group,
  setGroup,
  resetFunc: any = undefined
) => {
  if (group.length === 1) {
    const id = group[0].id;

    resetFunc && resetFunc(id);
    return setGroup([{ id }]);
  }
  setGroup(group.filter((el) => el.id !== removedGroup.id));
};
