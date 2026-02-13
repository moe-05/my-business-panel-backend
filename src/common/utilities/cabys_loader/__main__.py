import argparse
import pathlib
from typing import Dict, List, Optional
import excel_handler
import cabys_parser
from cabys_parser import CabysNode
from pprint import pprint

def main():
    parser = argparse.ArgumentParser(description="CABYS Loader")
    parser.add_argument("input_file", type=pathlib.Path, help="Path to the input file")
    parser.add_argument("--header", type=int, default=0, help="Row number to use as column names (default: 0)")
    parser.add_argument("--last-column", type=int, default=None, help="Last column to include in the data (optional)")
    args = parser.parse_args()

    input_file: pathlib.Path = args.input_file
    header: int = args.header
    last_column: int = int(args.last_column)

    if not input_file.exists():
        print(f"Error: The file {input_file} does not exist.")
        return
    
    dataframe = excel_handler.read_excel(input_file, header=header, last_column=last_column)
    column_names = cabys_parser.categorize_columns(dataframe)
    
    # pprint(f"Categories Columns: {column_names.categories}")
    # print()
    # pprint(f"Descriptions Columns: {column_names.descriptions}")

    tree = cabys_parser.build_cabys_tree(dataframe)
    # cabys_parser.save_tree_to_json(tree, "cabys_tree.json")
    move_inside_tree(tree)

def move_inside_tree(tree: Dict[str, CabysNode]) -> Optional[CabysNode]:
    def _walk(node: CabysNode, parent_code: Optional[str] = None):
        if node is None:
            return
        if node.data.tax_rate is not None:
            load_product(node)
        else:
            load_category(node)

        children = getattr(node, "children", None)
        if not children:
            return
        if isinstance(children, dict):
            iterable = children.values()
        else:
            iterable = children
        for child in iterable:
            _walk(child, parent_code=node.data.code)

    for root in tree.values():
        _walk(root)
    return None


def load_product(node: CabysNode):
    print(f"Loading product: {node.data.code} - {node.data.description} (Tax: {node.data.tax_rate})")

def load_category(node: CabysNode):
    return
    # print(f"Loading category: {node.data.code} - {node.data.description}")

if __name__ == "__main__":
    main()