from pandas import DataFrame
from dataclasses import dataclass, field

@dataclass
class ColumnInfo:
    name: str
    index: int

@dataclass
class CabysColumns:
    categories: list[ColumnInfo] = field(default_factory=list)
    descriptions: list[ColumnInfo] = field(default_factory=list)

@dataclass
class CabysCategory:
    code: str
    description: str
    tax_rate: float | None = None
    children: list['CabysCategory'] = field(default_factory=list)

def categorize_columns(dataframe: DataFrame) -> CabysColumns:
    columns = dataframe.columns.tolist()

    columns_info = CabysColumns()
    for index, column in enumerate(columns):
        column_lower = column.lower()
        if column_lower.startswith("categoría") or column_lower.startswith("categoria"):
            columns_info.categories.append(ColumnInfo(name=column, index=index))
        elif  column_lower.startswith("descripción") or column_lower.startswith("descripcion"):
            columns_info.descriptions.append(ColumnInfo(name=column, index=index))

    return columns_info